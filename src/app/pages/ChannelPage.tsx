import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useKlickStore } from "../../data/store";
import { AgentBadge } from "../components/AgentBadge";

export function ChannelPage() {
  const { channelId } = useParams();
  const channels = useKlickStore((s) => s.channels);
  const messages = useKlickStore((s) => s.messages);
  const members = useKlickStore((s) => s.members);
  const projects = useKlickStore((s) => s.projects);
  const postMessage = useKlickStore((s) => s.postMessage);

  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const channel = channels.find((c) => c.id === channelId);

  const byAuthor = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const roots = useMemo(
    () =>
      messages.filter((m) => m.channelId === channelId && !m.parentId),
    [messages, channelId],
  );

  const repliesFor = (id: string) =>
    messages.filter((m) => m.parentId === id).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  if (!channelId || !channel) {
    return (
      <div className="container py-v3">
        <p className="type-base text-theme-text-sec">Channel not found.</p>
        <Link to="/app/threads" className="btn-tertiary type-sm mt-v1 inline-flex">
          Back to threads
        </Link>
      </div>
    );
  }

  const project = channel.projectId
    ? projects.find((p) => p.id === channel.projectId)
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-theme-bg text-theme-text">
      <header className="shrink-0 border-b border-theme-border-01 bg-theme-bg">
        <div className="container max-w-none py-v2">
          <div className="max-w-prose-medium-wide">
            <h1 className="type-md font-normal tracking-[var(--tracking-lg)]">
              {channel.type === "dm" ? "@" : "#"}
              {channel.name}
            </h1>
            {channel.topic ? (
              <p className="type-base mt-v8/12 text-pretty text-theme-text-sec">{channel.topic}</p>
            ) : null}
            {project ? (
              <p className="type-product-sm mt-v8/12 text-theme-text-tertiary">
                Linked project · {project.name}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="thin-scrollbar flex-1 overflow-y-auto">
        <div className="container max-w-none py-v2">
          <ul className="mx-auto max-w-prose-medium-wide space-y-g1">
          {roots.map((m) => {
            const author = byAuthor.get(m.authorId);
            const replies = repliesFor(m.id);
            return (
              <li
                key={m.id}
                className={`card card--large !p-g1.5 ${
                  m.agent ? "agent-surface !shadow-none" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="type-sm font-medium text-theme-text">
                    {author?.name ?? "Unknown"}
                  </span>
                  {m.agent ? <AgentBadge compact /> : null}
                  <span className="type-product-sm text-theme-text-tertiary">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="type-base mt-v8/12 whitespace-pre-wrap text-pretty text-theme-text">
                  {m.body}
                </p>
                {replies.length > 0 ? (
                  <ul className="mt-3 space-y-2 border-l-2 border-theme-border-01 pl-3">
                    {replies.map((r) => {
                      const ra = byAuthor.get(r.authorId);
                      return (
                        <li key={r.id}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="type-sm font-medium">{ra?.name ?? "?"}</span>
                            {r.agent ? <AgentBadge compact /> : null}
                          </div>
                          <p className="type-sm mt-1 text-theme-text-sec">{r.body}</p>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                <button
                  type="button"
                  className="btn--quinary type-sm mt-2"
                  onClick={() => setReplyTo(m.id)}
                >
                  Reply in thread
                </button>
              </li>
            );
          })}
          </ul>
        </div>
      </div>

      <footer className="shrink-0 border-t border-theme-border-01 bg-theme-bg">
        <div className="container max-w-none py-v2">
          {replyTo ? (
            <div className="type-product-sm mb-2 max-w-prose-medium-wide text-theme-accent">
              Replying to thread ·{" "}
              <button type="button" className="btn--quinary !p-0" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
            </div>
          ) : null}
          <form
            className="mx-auto flex max-w-prose-medium-wide gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!body.trim()) return;
              postMessage(channel.id, body.trim(), replyTo);
              setBody("");
              setReplyTo(null);
            }}
          >
            <textarea
              className="app-input min-h-[72px] flex-1 resize-y"
              placeholder={
                channel.type === "dm"
                  ? "Message…"
                  : "Message the channel… (mirrors to Slack when connected)"
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <button type="submit" className="btn btn--sm self-end">
              Send
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
