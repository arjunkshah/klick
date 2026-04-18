import { consumeChatCompletionsSse, GROQ_CHAT_MODEL, type GroqMessage } from "./groqChat";

/**
 * Stream Dex replies through the backend proxy (`/api/dex/chat`).
 * The Groq API key never touches the browser.
 */
export async function streamDexChat(opts: {
  messages: GroqMessage[];
  onDelta: (text: string) => void;
  signal?: AbortSignal;
  model?: string;
}): Promise<void> {
  const res = await fetch("/api/dex/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: opts.messages,
      model: opts.model ?? GROQ_CHAT_MODEL,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) detail = j.error;
    } catch {
      try {
        detail = await res.text();
      } catch {
        /* keep statusText */
      }
    }
    throw new Error(detail || `Dex API error ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  await consumeChatCompletionsSse(reader, opts.onDelta);
}
