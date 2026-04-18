export type DexApiMessage = { role: "user" | "assistant"; content: string };

function dexApiUrl(): string {
  const origin = import.meta.env.VITE_DEX_API_ORIGIN;
  if (typeof origin === "string" && origin.trim()) {
    return origin.replace(/\/$/, "");
  }
  return "";
}

export async function fetchDexReply(
  messages: DexApiMessage[],
  workspaceContext: string,
): Promise<string> {
  const base = dexApiUrl();
  const url = `${base}/api/dex/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, workspaceContext }),
  });
  let data: { reply?: string; error?: string } = {};
  try {
    data = (await res.json()) as { reply?: string; error?: string };
  } catch {
    throw new Error("Invalid response from Dex API");
  }
  if (!res.ok) {
    throw new Error(data.error || `Dex API error (${res.status})`);
  }
  if (!data.reply?.trim()) {
    throw new Error(data.error || "Empty reply");
  }
  return data.reply.trim();
}
