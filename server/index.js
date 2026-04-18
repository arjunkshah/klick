/**
 * Dex API proxy — keeps GROQ_API_KEY on the server only.
 * Run alongside Vite: `npm run dev` (starts this + Vite).
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";

/** Same keys as Vite’s loadEnv — does not override vars already set in the shell. */
function loadDotEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const filePath = path.resolve(process.cwd(), name);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (!key) continue;
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}

loadDotEnvFiles();

const PORT = Number(process.env.DEX_API_PORT || process.env.PORT || 8787);
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_DEFAULT = "openai/gpt-oss-120b";

function json(res, status, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(s),
  });
  res.end(s);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS" && req.url?.startsWith("/api/")) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/dex/chat") {
    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) {
      json(res, 500, { error: "Server is not configured (missing GROQ_API_KEY)." });
      return;
    }

    const chunks = [];
    let total = 0;
    const maxBody = 2_000_000;
    for await (const chunk of req) {
      total += chunk.length;
      if (total > maxBody) {
        json(res, 413, { error: "Request body too large" });
        return;
      }
      chunks.push(chunk);
    }

    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      json(res, 400, { error: "Invalid JSON body" });
      return;
    }

    const { messages } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      json(res, 400, { error: "messages must be a non-empty array" });
      return;
    }

    const model = typeof body.model === "string" ? body.model : MODEL_DEFAULT;

    let groqRes;
    try {
      groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 8192,
        }),
      });
    } catch (e) {
      json(res, 502, { error: e instanceof Error ? e.message : "Upstream fetch failed" });
      return;
    }

    if (!groqRes.ok) {
      let detail = groqRes.statusText;
      try {
        const j = await groqRes.json();
        if (j?.error?.message) detail = j.error.message;
      } catch {
        try {
          detail = await groqRes.text();
        } catch {
          /* ignore */
        }
      }
      json(res, groqRes.status >= 500 ? 502 : 400, {
        error: detail || `Groq error ${groqRes.status}`,
      });
      return;
    }

    if (!groqRes.body) {
      json(res, 502, { error: "Empty upstream response" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const nodeIn = Readable.fromWeb(groqRes.body);
    nodeIn.pipe(res);
    nodeIn.on("error", () => {
      try {
        res.destroy();
      } catch {
        /* ignore */
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `[dex-api] Port ${PORT} is already in use.\n` +
        `  • Stop the other process (e.g. macOS: lsof -i :${PORT} then kill <PID>)\n` +
        `  • Or use another port: DEX_API_PORT=8788 in .env.local (Vite reads DEX_API_PROXY / DEX_API_PORT for /api proxy)`,
    );
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`[dex-api] http://localhost:${PORT} (POST /api/dex/chat)`);
});
