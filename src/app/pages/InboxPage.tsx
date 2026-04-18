import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { InboxItem, InboxItemType } from "../../data/types";
import { useKlickStore } from "../../data/store";

type InboxFilter = "all" | "unread" | InboxItemType;

function InboxTypeBadge({ type }: { type: InboxItemType }) {
  const label =
    type === "agent_proposal"
      ? "Agent"
      : type === "mention"
        ? "Mention"
        : type === "slack_mirror"
          ? "Slack"
          : "System";
  return <span className="today-inbox-row__badge">{label}</span>;
}

function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const d = Date.now() - t;
  const sec = Math.floor(d / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 14) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}

function issueRef(issueId: string): string {
  const n = issueId.replace(/\D/g, "") || "0";
  return `KLK-${n}`;
}

function sortInbox(items: InboxItem[]): InboxItem[] {
  return [...items].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

const FILTER_DEFS: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "agent_proposal", label: "Agent" },
  { id: "mention", label: "Mentions" },
  { id: "slack_mirror", label: "Slack" },
  { id: "system", label: "System" },
];

export function InboxPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const inbox = useKlickStore((s) => s.inbox);
  const markInboxRead = useKlickStore((s) => s.markInboxRead);
  const markAllInboxRead = useKlickStore((s) => s.markAllInboxRead);
  const dismissInbox = useKlickStore((s) => s.dismissInbox);

  const [filter, setFilter] = useState<InboxFilter>("all");

  const counts = useMemo(() => {
    const unread = inbox.filter((n) => !n.read).length;
    return {
      all: inbox.length,
      unread,
      agent_proposal: inbox.filter((n) => n.type === "agent_proposal").length,
      mention: inbox.filter((n) => n.type === "mention").length,
      slack_mirror: inbox.filter((n) => n.type === "slack_mirror").length,
      system: inbox.filter((n) => n.type === "system").length,
    };
  }, [inbox]);

  const filtered = useMemo(() => {
    let list = inbox;
    if (filter === "unread") list = list.filter((n) => !n.read);
    else if (filter !== "all") list = list.filter((n) => n.type === filter);
    return sortInbox(list);
  }, [inbox, filter]);

  const unreadTotal = counts.unread;

  return (
    <div className="app-page">
      <div className="today-page inbox-page">
        <header className="today-page__header">
          <p className="today-page__workspace">{workspace.name}</p>
          <div className="today-page__title-row">
            <h1 className="today-page__title">Inbox</h1>
            <div className="inbox-page__title-actions">
              {unreadTotal > 0 ? (
                <span className="today-page__date" aria-live="polite">
                  {unreadTotal} unread
                </span>
              ) : (
                <span className="today-page__date">Caught up</span>
              )}
            </div>
          </div>
        </header>

        <section className="today-section today-section--flush" aria-labelledby="inbox-pulse-heading">
          <div className="today-section__head">
            <h2 id="inbox-pulse-heading" className="today-section__label">
              Triage
            </h2>
            <div className="today-section__actions">
              {unreadTotal > 0 ? (
                <button type="button" className="inbox-page__text-btn" onClick={() => markAllInboxRead()}>
                  Mark all read
                </button>
              ) : null}
              <Link to="/app/dex" className="today-link">
                Ask Dex
              </Link>
            </div>
          </div>
          <div className="today-panel">
            <ul className="today-digest">
              <li className="today-digest__item">
                <span className="today-digest__bullet" aria-hidden />
                <span className="today-digest__text">
                  <strong>{counts.unread}</strong> unread · <strong>{counts.agent_proposal}</strong> agent ·{" "}
                  <strong>{counts.mention}</strong> mention
                  {counts.slack_mirror ? (
                    <>
                      {" "}
                      · <strong>{counts.slack_mirror}</strong> Slack
                    </>
                  ) : null}
                  .
                </span>
              </li>
              <li className="today-digest__item">
                <span className="today-digest__bullet" aria-hidden />
                <span className="today-digest__text">
                  Approvals and mirrors land here first—dismiss noise or open{" "}
                  <Link to="/app/threads" className="today-link">
                    Threads
                  </Link>{" "}
                  to reply in channel.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section className="today-section" aria-labelledby="inbox-list-heading">
          <div className="today-section__head">
            <h2 id="inbox-list-heading" className="today-section__label">
              Notifications
            </h2>
            <span className="today-section__meta">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="inbox-page__filters" role="tablist" aria-label="Filter inbox">
            {FILTER_DEFS.map(({ id, label }) => {
              const c = id === "all" ? counts.all : id === "unread" ? counts.unread : counts[id];
              const active = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`inbox-page__chip${active ? " inbox-page__chip--active" : ""}`}
                  onClick={() => setFilter(id)}
                >
                  {label}
                  <span className="inbox-page__chip-count">{c}</span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <p className="today-empty">Nothing in this view—try another filter or check back later.</p>
          ) : (
            <div className="today-panel">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className={`inbox-item${item.read ? "" : " inbox-item--unread"}`}
                  aria-label={item.title}
                >
                  <div className="inbox-item__main">
                    <div className="inbox-item__top">
                      <h3 className="inbox-item__title">{item.title}</h3>
                      <InboxTypeBadge type={item.type} />
                    </div>
                    <p className="inbox-item__body">{item.body}</p>
                    <div className="inbox-item__meta">
                      <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
                      {item.relatedIssueId ? (
                        <>
                          <span className="inbox-item__meta-sep" aria-hidden>
                            ·
                          </span>
                          <Link to="/app/issues" className="inbox-item__issue-link">
                            {issueRef(item.relatedIssueId)}
                          </Link>
                        </>
                      ) : null}
                      {item.relatedRunId ? (
                        <>
                          <span className="inbox-item__meta-sep" aria-hidden>
                            ·
                          </span>
                          <Link to="/app/runs" className="inbox-item__issue-link">
                            Run
                          </Link>
                        </>
                      ) : null}
                      {item.relatedChannelId ? (
                        <>
                          <span className="inbox-item__meta-sep" aria-hidden>
                            ·
                          </span>
                          <Link to="/app/threads" className="inbox-item__issue-link">
                            Thread
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="inbox-item__actions">
                    <button
                      type="button"
                      className="inbox-page__text-btn"
                      onClick={() => markInboxRead(item.id, !item.read)}
                    >
                      {item.read ? "Mark unread" : "Mark read"}
                    </button>
                    <button type="button" className="inbox-page__text-btn" onClick={() => dismissInbox(item.id)}>
                      Dismiss
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
