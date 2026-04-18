export const GROQ_CHAT_MODEL = "openai/gpt-oss-120b";

export type GroqMessage = { role: "system" | "user" | "assistant"; content: string };

/** Parse OpenAI-compatible streaming chat completions (SSE). */
export async function consumeChatCompletionsSse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onDelta: (text: string) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const piece = parsed.choices?.[0]?.delta?.content;
        if (piece) onDelta(piece);
      } catch {
        /* incomplete JSON line */
      }
    }
  }
}
