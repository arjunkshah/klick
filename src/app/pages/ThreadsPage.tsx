import { Hash, Lock, SendHorizontal, User, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Channel, ChannelMessage, TeamMember } from "../../data/types";
import { useKlickStore } from "../../data/store";

function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
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

function ChannelGlyph({ channel }: { channel: Channel }) {
  if (channel.type === "dm") {
    return <User className="threads-channel__glyph" size={14} strokeWidth={1.75} aria-hidden />;
  }
  if (channel.type === "private") {
    return <Lock className="threads-channel__glyph" size={14} strokeWidth={1.75} aria-hidden />;
  }
  return <Hash className="threads-channel__glyph" size={14} strokeWidth={1.75} aria-hidden />;
}

function threadForChannel(messages: ChannelMessage[], channelId: string) {
  const inCh = messages.filter((m) => m.channelId === channelId);
  const byParent = new Map<string | null, ChannelMessage[]>();
  for (const m of inCh) {
    const k = m.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(m);
  }
  const roots = byParent.get(null) ?? [];
  roots.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return roots.map((root) => ({
    root,
    replies: (byParent.get(root.id) ?? []).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),
  }));
}

function lastActivity(messages: ChannelMessage[], channelId: string): ChannelMessage | null {
  const inCh = messages.filter((m) => m.channelId === channelId);
  if (inCh.length === 0) return null;
  return inCh.reduce((a, b) =>
    new Date(a.createdAt).getTime() >= new Date(b.createdAt).getTime() ? a : b,
  );
}

function MessageBubble({
  msg,
  author,
  onReply,
}: {
  msg: ChannelMessage;
  author: TeamMember | null;
  onReply: (m: ChannelMessage) => void;
}) {
  const initials = author
    ? author.name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  return (
    <div className={`threads-msg${msg.agent ? " threads-msg--agent" : ""}`}>
      <span className="threads-msg__avatar" title={author?.name ?? "Unknown"}>
        {msg.agent ? "◇" : initials}
      </span>
      <div className="threads-msg__body">
        <div className="threads-msg__bar">
          <span className="threads-msg__author">{msg.agent ? "Klick Agent" : author?.name ?? "Unknown"}</span>
          <time className="threads-msg__time" dateTime={msg.createdAt}>
            {formatRelativeTime(msg.createdAt)}
          </time>
        </div>
        <p className="threads-msg__text">{msg.body}</p>
        <button type="button" className="threads-msg__reply" onClick={() => onReply(msg)}>
          Reply
        </button>
      </div>
    </div>
  );
}

export function ThreadsPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const channels = useKlickStore((s) => s.channels);
  const messages = useKlickStore((s) => s.messages);
  const members = useKlickStore((s) => s.members);
  const projects = useKlickStore((s) => s.projects);
  const postMessage = useKlickStore((s) => s.postMessage);

  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => {
      const la = lastActivity(messages, a.id);
      const lb = lastActivity(messages, b.id);
      const ta = la ? new Date(la.createdAt).getTime() : 0;
      const tb = lb ? new Date(lb.createdAt).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return a.name.localeCompare(b.name);
    });
  }, [channels, messages]);

  const [channelId, setChannelId] = useState("");

  const effectiveChannelId = useMemo(() => {
    if (channelId && sortedChannels.some((c) => c.id === channelId)) return channelId;
    return sortedChannels[0]?.id ?? "";
  }, [channelId, sortedChannels]);

  const active = sortedChannels.find((c) => c.id === effectiveChannelId) ?? sortedChannels[0];
  const threads = useMemo(
    () => (active ? threadForChannel(messages, active.id) : []),
    [messages, active],
  );

  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ChannelMessage | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, effectiveChannelId, threads.length]);

  const submit = useCallback(() => {
    if (!active) return;
    const t = draft.trim();
    if (!t) return;
    postMessage(active.id, t, replyTo?.id ?? null);
    setDraft("");
    setReplyTo(null);
  }, [active, draft, postMessage, replyTo]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      submit();
    },
    [submit],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const projectLabel = active?.projectId ? projectsById.get(active.projectId)?.name : null;

  return (
    <div className="app-page app-page--threads">
      <div className="threads-page">
        <div className="threads-page__intro">
          <header className="today-page__header threads-page__header">
            <p className="today-page__workspace">{workspace.name}</p>
            <div className="today-page__title-row">
              <h1 className="today-page__title">Threads</h1>
              <Link to="/app/inbox" className="today-link">
                Inbox
              </Link>
            </div>
          </header>

          <p className="threads-page__lede">
            Channel mirrors and DMs—reply as you. Messages post as <strong>you</strong> in this demo.
          </p>
        </div>

        <div className="threads-shell">
          <aside className="threads-channels" aria-label="Channels">
            {sortedChannels.length === 0 ? (
              <p className="threads-channels__empty">No channels yet.</p>
            ) : (
              <ul className="threads-channel-list">
                {sortedChannels.map((ch) => {
                  const last = lastActivity(messages, ch.id);
                  const sel = ch.id === active?.id;
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        className={`threads-channel${sel ? " threads-channel--active" : ""}`}
                        onClick={() => {
                          setChannelId(ch.id);
                          setReplyTo(null);
                        }}
                      >
                        <span className="threads-channel__row">
                          <ChannelGlyph channel={ch} />
                          <span className="threads-channel__name">{ch.name}</span>
                        </span>
                        {last ? (
                          <span className="threads-channel__preview">
                            <span className="threads-channel__snippet">{last.body}</span>
                            <time className="threads-channel__when" dateTime={last.createdAt}>
                              {formatRelativeTime(last.createdAt)}
                            </time>
                          </span>
                        ) : (
                          <span className="threads-channel__preview threads-channel__preview--muted">
                            No messages yet
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="threads-main" aria-label="Conversation">
            {active ? (
              <>
                <header className="threads-main__head">
                  <div className="threads-main__title-row">
                    <ChannelGlyph channel={active} />
                    <div>
                      <h2 className="threads-main__title">{active.name}</h2>
                      <p className="threads-main__topic">{active.topic}</p>
                    </div>
                  </div>
                  {projectLabel ? (
                    <span className="threads-main__project" title="Linked project">
                      {projectLabel}
                    </span>
                  ) : null}
                </header>

                <div className="threads-stream thin-scrollbar" ref={streamRef} role="log" aria-live="polite">
                  {threads.length === 0 ? (
                    <p className="threads-stream__empty">Start the thread—say hello or paste context.</p>
                  ) : (
                    threads.map(({ root, replies }) => (
                      <div key={root.id} className="threads-thread">
                        <MessageBubble
                          msg={root}
                          author={membersById.get(root.authorId) ?? null}
                          onReply={setReplyTo}
                        />
                        {replies.map((r) => (
                          <div key={r.id} className="threads-msg-wrap threads-msg-wrap--reply">
                            <MessageBubble
                              msg={r}
                              author={membersById.get(r.authorId) ?? null}
                              onReply={setReplyTo}
                            />
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>

                <form className="threads-composer" onSubmit={onSubmit}>
                  {replyTo ? (
                    <div className="threads-composer__replying">
                      <span className="threads-composer__replying-label">
                        Replying to{" "}
                        <strong>
                          {replyTo.agent
                            ? "Klick Agent"
                            : membersById.get(replyTo.authorId)?.name ?? "message"}
                        </strong>
                      </span>
                      <button
                        type="button"
                        className="threads-composer__cancel-reply"
                        onClick={() => setReplyTo(null)}
                        aria-label="Cancel reply"
                      >
                        <X size={16} strokeWidth={1.75} aria-hidden />
                      </button>
                    </div>
                  ) : null}
                  <div className="threads-composer__row">
                    <textarea
                      className="threads-composer__input thin-scrollbar"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder={`Message #${active.name}…`}
                      rows={2}
                      aria-label="Message"
                    />
                    <button
                      type="submit"
                      className="threads-composer__send"
                      disabled={!draft.trim()}
                      aria-label="Send"
                    >
                      <SendHorizontal size={18} strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <p className="threads-stream__empty">Select a channel to view messages.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
