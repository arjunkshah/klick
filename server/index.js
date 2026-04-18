/**
 * Dex API — Gemini 2.5 Flash. Local dev: `npm run dev` (with Vite proxy /api → this server).
 * Env: geminikey (or GEMINIKEY). Optional: GEMINI_MODEL (default gemini-2.5-flash)
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

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
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getKey() {
  return (process.env.geminikey || process.env.GEMINIKEY || "").trim();
}

function json(res, status, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(s),
  });
  res.end(s);
}

function toGeminiContents(messages) {
  const contents = [];
  for (const m of messages) {
    if (!m || typeof m.content !== "string") continue;
    const role = m.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: m.content }] });
  }
  return contents;
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
    const key = getKey();
    if (!key) {
      json(res, 500, { error: "Missing geminikey in environment (.env.local or shell)." });
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

    const { messages, workspaceContext } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      json(res, 400, { error: "messages must be a non-empty array" });
      return;
    }

    const systemText = `You are **Dex**, a concise workspace copilot for the Klick app.
Rules:
- Ground answers in WORKSPACE_JSON. If data is missing, say so.
- Use short markdown (**bold**, bullets). No filler.
- Do not invent issues, tasks, or people not in WORKSPACE_JSON.

WORKSPACE_JSON:
${typeof workspaceContext === "string" ? workspaceContext : JSON.stringify(workspaceContext ?? {})}`;

    const contents = toGeminiContents(messages);
    if (contents.length === 0) {
      json(res, 400, { error: "No valid messages" });
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

    let geminiRes;
    try {
      geminiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: { temperature: 0.65, maxOutputTokens: 8192 },
        }),
      });
    } catch (e) {
      json(res, 502, { error: e instanceof Error ? e.message : "Upstream fetch failed" });
      return;
    }

    const raw = await geminiRes.text();
    if (!geminiRes.ok) {
      json(res, geminiRes.status >= 500 ? 502 : 400, {
        error: raw.slice(0, 800) || `Gemini HTTP ${geminiRes.status}`,
      });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      json(res, 502, { error: "Invalid Gemini response" });
      return;
    }

    const text =
      parsed?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("") || "";

    if (!text) {
      const block = parsed?.promptFeedback?.blockReason;
      json(res, 400, {
        error: block ? `Blocked: ${block}` : "Empty model response",
      });
      return;
    }

    json(res, 200, { reply: text });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`[dex-api] Port ${PORT} in use. Set DEX_API_PORT in .env.local`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`[dex-api] Gemini http://localhost:${PORT} (POST /api/dex/chat)`);
});
