import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDexChatStore } from "../../data/dexChatStore";
import { streamDexChat } from "../../lib/dexChatApi";
import { buildDexWorkspaceContext } from "../../lib/dexWorkspaceContext";
import { GROQ_CHAT_MODEL, type GroqMessage } from "../../lib/groqChat";
import { AgentBadge } from "../components/AgentBadge";

const DEX_SYSTEM = `You are **Dex**, Klick's AI superagent. You run on **${GROQ_CHAT_MODEL}** via Groq (fast inference).

You receive a fresh **workspace snapshot** with every user message. Use it to answer questions, search across issues/docs/threads/tasks/people/playbooks, summarize, compare, and draft content.

Rules:
- Ground answers in the snapshot when relevant; say when something isn't in the data.
- Prefer concise, scannable answers; use markdown headings and bullets when helpful.
- When drafting issues, docs, Slack-style messages, or playbook steps, produce ready-to-paste copy and name the target (e.g. issue id, doc id, channel).
- Never invent integrations or claim external APIs ran—this is local-first data + your reasoning unless the user clearly asks hypotheticals.
- Be proactive: suggest next actions the human could take in Klick (link patterns like /app/issues/i1, /app/docs/d1).`;

export function DexPage() {
  const messages = useDexChatStore((s) => s.messages);
  const addUserMessage = useDexChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useDexChatStore((s) => s.addAssistantMessage);
  const updateLastAssistant = useDexChatStore((s) => s.updateLastAssistant);
  const clearDex = useDexChatStore((s) => s.clear);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const expandedInputRef = useRef<HTMLTextAreaElement>(null);

  const chatActive = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (chatActive) expandedInputRef.current?.focus();
  }, [chatActive]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    setError(null);
    setInput("");
    addUserMessage(text);

    const snapshot = buildDexWorkspaceContext();
    const prior = useDexChatStore.getState().messages;
    const history: GroqMessage[] = [
      {
        role: "system",
        content: `${DEX_SYSTEM}\n\n---\n\n# Current workspace snapshot\n\n${snapshot}`,
      },
    ];
    for (const m of prior) {
      if (m.role === "user" || m.role === "assistant") {
        history.push({ role: m.role, content: m.content });
      }
    }

    setBusy(true);
    addAssistantMessage("");
    const ac = new AbortController();
    abortRef.current = ac;

    let acc = "";
    try {
      await streamDexChat({
        messages: history,
        signal: ac.signal,
        onDelta: (piece) => {
          acc += piece;
          updateLastAssistant(acc);
        },
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        updateLastAssistant(acc ? `${acc}\n\n_[Stopped]_` : "_[Stopped]_");
      } else {
        const msg = e instanceof Error ? e.message : "Request failed";
        setError(msg);
        updateLastAssistant(
          acc || `_Dex couldn't complete the request._\n\n${msg}`,
        );
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [input, busy, addUserMessage, addAssistantMessage, updateLastAssistant]);

  const composer = (
    <div className="flex gap-2">
      <textarea
        ref={expandedInputRef}
        className="app-input min-h-[52px] flex-1 resize-y rounded-sm py-3"
        placeholder="Ask a follow-up…"
        value={input}
        disabled={busy}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send();
          }
        }}
      />
      {busy ? (
        <button
          type="button"
          className="btn btn--secondary btn--sm self-end"
          onClick={() => abortRef.current?.abort()}
        >
          Stop
        </button>
      ) : (
        <button
          type="button"
          className="btn btn--sm self-end"
          disabled={!input.trim()}
          onClick={() => void send()}
        >
          Send
        </button>
      )}
    </div>
  );

  if (!chatActive) {
    return (
      <div className="dex-landing relative flex h-full min-h-0 flex-col bg-transparent text-theme-text">
        <header className="auth-page__header shrink-0">
          <div className="container flex h-[var(--site-header-height)] w-full max-w-none items-center justify-between">
            <Link
              to="/app"
              className="btn--quinary type-sm no-underline transition-opacity duration-[var(--duration)] hover:opacity-88"
            >
              ← Today
            </Link>
            <span className="type-product-sm text-theme-text-tertiary">{GROQ_CHAT_MODEL}</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 md:py-14">
          <div className="w-full max-w-[34rem] text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <h1 className="type-md font-normal tracking-[var(--tracking-lg)]">Dex</h1>
              <AgentBadge />
            </div>
            <p className="type-base mx-auto mb-8 max-w-md text-pretty text-theme-text-sec">
              One prompt to search issues, docs, threads, and tasks—then continue in full chat.
            </p>

            {error ? (
              <div
                className="type-sm mx-auto mb-4 max-w-md rounded-sm border border-theme-border-02 bg-theme-card-hex px-3 py-2 text-theme-accent"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div className="card card--large text-left shadow-[0_22px_56px_-28px_color-mix(in_oklab,var(--color-theme-fg)_18%,transparent)]">
              <label className="type-product-sm mb-2 block font-medium uppercase tracking-[0.06em] text-theme-text-tertiary">
                Message
              </label>
              <textarea
                className="app-input mb-4 min-h-[7.5rem] w-full resize-y rounded-sm py-3 text-base leading-relaxed"
                placeholder="e.g. Summarize open issues tagged billing and draft a Slack update…"
                value={input}
                disabled={busy}
                autoFocus
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="type-product-sm text-theme-text-tertiary">
                  Enter to send · Shift+Enter for newline
                </span>
                <div className="flex gap-2">
                  {busy ? (
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => abortRef.current?.abort()}
                    >
                      Stop
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn--sm"
                    disabled={!input.trim() || busy}
                    onClick={() => void send()}
                  >
                    {busy ? "Sending…" : "Ask Dex"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-theme-bg text-theme-text">
      <header className="shrink-0 border-b border-theme-border-01 bg-theme-bg">
        <div className="container flex max-w-none flex-wrap items-center justify-between gap-g1 py-v2">
          <div className="max-w-prose-medium-wide">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="type-md font-normal tracking-[var(--tracking-lg)]">Dex</h1>
              <AgentBadge />
              <span className="type-product-sm text-theme-text-tertiary">{GROQ_CHAT_MODEL}</span>
            </div>
            <p className="type-base mt-v8/12 text-pretty text-theme-text-sec">
              Superagent over your workspace—pick up where you left off.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link to="/app" className="btn--quinary type-sm">
              Today
            </Link>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={busy}
              onClick={() => {
                if (!confirm("Clear Dex chat history?")) return;
                clearDex();
                setError(null);
                setInput("");
              }}
            >
              Clear chat
            </button>
          </div>
        </div>
      </header>

      <div className="thin-scrollbar flex-1 overflow-y-auto">
        <div className="container max-w-none py-v2">
          <div className="mx-auto max-w-prose-medium-wide space-y-g1 pb-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "card card--large ml-4 !p-g1.5 sm:ml-8"
                    : "card card--large agent-surface mr-2 !p-g1.5 sm:mr-4"
                }
              >
                <div className="type-product-sm mb-1 text-theme-text-tertiary">
                  {m.role === "user" ? "You" : "Dex"}
                </div>
                <div className="type-base whitespace-pre-wrap text-pretty text-theme-text">
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-theme-border-01 bg-theme-bg">
        <div className="container max-w-none py-v2">
          <div className="mx-auto max-w-prose-medium-wide space-y-2">
            {error ? (
              <div className="type-sm text-theme-accent" role="alert">
                {error}
              </div>
            ) : null}
            {composer}
            <p className="type-product-sm text-theme-text-tertiary">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
