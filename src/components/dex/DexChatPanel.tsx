import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, MessageSquarePlus, SendHorizontal, Trash2 } from "lucide-react";
import type { DexChat } from "../../data/types";
import { useKlickStore } from "../../data/store";

const QUICK_PROMPTS = [
  { label: "Summarize today", text: "Summarize today" },
  { label: "What’s blocked?", text: "What’s blocked?" },
  { label: "Inbox", text: "What’s in my inbox?" },
] as const;

function formatRelativeShort(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const d = Date.now() - t;
  const sec = Math.floor(d / 1000);
  if (sec < 60) return "now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h`;
  const days = Math.floor(hr / 24);
  return `${days}d`;
}

function chatPreview(chat: DexChat): string {
  const last = [...chat.messages].reverse().find((m) => m.role === "user");
  if (last?.content) {
    const s = last.content.trim().split("\n")[0] ?? "";
    return s.length > 48 ? `${s.slice(0, 48)}…` : s;
  }
  return "New conversation";
}

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
  const dexChats = useKlickStore((s) => s.dexChats);
  const dexActiveChatId = useKlickStore((s) => s.dexActiveChatId);
  const messages = useKlickStore((s) => {
    const c = s.dexChats.find((x) => x.id === s.dexActiveChatId) ?? s.dexChats[0];
    return c?.messages ?? [];
  });
  const dexBusy = useKlickStore((s) => s.dexBusy);
  const dexLastError = useKlickStore((s) => s.dexLastError);
  const sendDexMessage = useKlickStore((s) => s.sendDexMessage);
  const createDexChat = useKlickStore((s) => s.createDexChat);
  const setDexActiveChat = useKlickStore((s) => s.setDexActiveChat);
  const deleteDexChat = useKlickStore((s) => s.deleteDexChat);
  const clearDexChat = useKlickStore((s) => s.clearDexChat);

  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const sortedChats = useMemo(
    () => [...dexChats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [dexChats],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, dexBusy, dexActiveChatId]);

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
    <div className="dex-layout">
      <aside className="dex-chats-sidebar thin-scrollbar" aria-label="Dex conversations">
        <div className="dex-chats-sidebar__head">
          <button type="button" className="dex-chats-new" onClick={() => createDexChat()}>
            <MessageSquarePlus size={16} strokeWidth={1.75} aria-hidden />
            New chat
          </button>
        </div>
        <ul className="dex-chats-list" role="list">
          {sortedChats.map((chat) => {
            const active = chat.id === dexActiveChatId;
            return (
              <li key={chat.id} className="dex-chats-list__item">
                <button
                  type="button"
                  className={`dex-chat-row${active ? " dex-chat-row--active" : ""}`}
                  onClick={() => setDexActiveChat(chat.id)}
                >
                  <span className="dex-chat-row__title">{chat.title || "Chat"}</span>
                  <span className="dex-chat-row__meta">
                    <time dateTime={chat.updatedAt}>{formatRelativeShort(chat.updatedAt)}</time>
                  </span>
                  <span className="dex-chat-row__preview">{chatPreview(chat)}</span>
                </button>
                {dexChats.length > 1 ? (
                  <button
                    type="button"
                    className="dex-chat-row__delete"
                    title="Delete chat"
                    aria-label={`Delete ${chat.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDexChat(chat.id);
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="dex-shell">
        <div className="dex-transcript thin-scrollbar" role="log" aria-live="polite">
          <div className="dex-transcript__inner">
            {messages.map((m) => (
              <div key={m.id} className={`dex-msg dex-msg--${m.role}`}>
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
            <span className="dex-composer__hint">
              Chats sync to Firebase. Switch threads anytime—context is per conversation.
            </span>
            <button type="button" className="dex-composer__clear" onClick={() => clearDexChat()}>
              Reset thread
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
    </div>
  );
}
