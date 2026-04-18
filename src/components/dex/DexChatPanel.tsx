import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, SendHorizontal } from "lucide-react";
import { useKlickStore } from "../../data/store";

const QUICK_PROMPTS = [
  { label: "Summarize today", text: "Summarize today" },
  { label: "What’s blocked?", text: "What’s blocked?" },
  { label: "Inbox", text: "What’s in my inbox?" },
] as const;

function FormattedDexText({ text }: { text: string }) {
  const segments = text.split(/\*\*/);
  if (segments.length === 1) return <>{text}</>;
  return (
    <>
      {segments.map((segment, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="dex-msg__strong">
            {segment}
          </strong>
        ) : (
          <span key={i}>{segment}</span>
        ),
      )}
    </>
  );
}

export function DexChatPanel() {
  const messages = useKlickStore((s) => s.dexMessages);
  const dexBusy = useKlickStore((s) => s.dexBusy);
  const dexLastError = useKlickStore((s) => s.dexLastError);
  const sendDexMessage = useKlickStore((s) => s.sendDexMessage);
  const clearDexChat = useKlickStore((s) => s.clearDexChat);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, dexBusy]);

  const submit = useCallback(async () => {
    const t = draft.trim();
    if (!t || dexBusy) return;
    setDraft("");
    await sendDexMessage(t);
  }, [draft, dexBusy, sendDexMessage]);

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      void submit();
    },
    [submit],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void submit();
      }
    },
    [submit],
  );

  return (
    <div className="dex-shell">
      <div className="dex-transcript thin-scrollbar" role="log" aria-live="polite">
        <div className="dex-transcript__inner">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`dex-msg dex-msg--${m.role}`}
            >
              <span className="dex-msg__role">{m.role === "user" ? "You" : "Dex"}</span>
              <div className="dex-msg__body">
                <FormattedDexText text={m.content} />
              </div>
            </div>
          ))}
          {dexBusy ? (
            <div className="dex-msg dex-msg--assistant dex-msg--typing" aria-busy>
              <span className="dex-msg__role">Dex</span>
              <div className="dex-msg__body dex-msg__typing">
                <Loader2 className="dex-msg__spinner" size={16} strokeWidth={1.75} aria-hidden />
                Thinking…
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>

      <div className="dex-composer">
        <div className="dex-composer__top">
          <span className="dex-composer__hint">Answers use your synced Firebase workspace + Gemini.</span>
          <button type="button" className="dex-composer__clear" onClick={() => clearDexChat()}>
            Clear
          </button>
        </div>
        {dexLastError ? (
          <p className="dex-composer__warn" role="status">
            API issue (showing fallback when possible): {dexLastError}
          </p>
        ) : null}
        <div className="dex-composer__shortcuts">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="dex-chip"
              disabled={dexBusy}
              onClick={() => void sendDexMessage(p.text)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <form className="dex-composer__form" onSubmit={onSubmit}>
          <textarea
            className="dex-composer__input thin-scrollbar"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask Dex anything about this workspace…"
            rows={2}
            disabled={dexBusy}
            aria-label="Message Dex"
          />
          <button
            type="submit"
            className="dex-composer__send"
            aria-label="Send"
            disabled={!draft.trim() || dexBusy}
          >
            {dexBusy ? (
              <Loader2 className="dex-msg__spinner" size={18} strokeWidth={1.75} aria-hidden />
            ) : (
              <SendHorizontal size={18} strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
