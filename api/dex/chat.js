/**
 * Vercel serverless: POST /api/dex/chat
 * Env: geminikey (Google AI API key). Optional: GEMINI_MODEL (default gemini-2.5-flash)
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getKey() {
  return (process.env.geminikey || process.env.GEMINIKEY || "").trim();
}

function cors(res, methods = "POST, OPTIONS") {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = getKey();
  if (!key) {
    res.status(500).json({ error: "Server missing geminikey (set in Vercel env)." });
    return;
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const { messages, workspaceContext } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages required" });
    return;
  }

  const systemText = `You are **Dex**, a concise workspace copilot for the Klick app.
Rules:
- Ground every answer in the WORKSPACE_JSON below. If data is missing, say so and suggest what to add.
- Prefer short markdown: **bold** for emphasis, bullet lists for actions. No filler.
- Do not invent issues, tasks, or people not present in WORKSPACE_JSON.

WORKSPACE_JSON:
${typeof workspaceContext === "string" ? workspaceContext : JSON.stringify(workspaceContext ?? {})}`;

  const contents = toGeminiContents(messages);
  if (contents.length === 0) {
    res.status(400).json({ error: "No valid messages" });
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
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 8192,
        },
      }),
    });
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : "Upstream fetch failed" });
    return;
  }

  const raw = await geminiRes.text();
  if (!geminiRes.ok) {
    res.status(geminiRes.status >= 500 ? 502 : 400).json({
      error: raw.slice(0, 500) || `Gemini HTTP ${geminiRes.status}`,
    });
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    res.status(502).json({ error: "Invalid Gemini response" });
    return;
  }

  const text =
    parsed?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("") || "";

  if (!text) {
    const block = parsed?.promptFeedback?.blockReason;
    res.status(400).json({
      error: block ? `Blocked: ${block}` : "Empty model response",
    });
    return;
  }

  res.status(200).json({ reply: text });
}
