import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";
import { AgentBadge } from "../components/AgentBadge";

export function InboxPage() {
  const inbox = useKlickStore((s) => s.inbox);
  const markInboxRead = useKlickStore((s) => s.markInboxRead);
  const dismissInbox = useKlickStore((s) => s.dismissInbox);

  return (
    <div className="mx-auto max-w-prose-medium-wide px-g2 py-v2">
      <div className="mb-v2 border-b border-theme-border-01 pb-v2">
        <h1 className="type-md mb-v1">Inbox</h1>
        <p className="type-sm text-theme-text-sec">
          Slack mirrors, mentions, and agent proposals—triage before you deep work.
        </p>
      </div>
      <ul className="flex flex-col gap-g1">
        {inbox.map((item) => (
          <li
            key={item.id}
            className={`card card--large !p-g1.5 ${item.read ? "opacity-85" : "border-theme-border-02-5"}`}
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="type-product-sm uppercase tracking-wide text-theme-text-mid">
                {item.type.replace(/_/g, " ")}
              </span>
              {item.type === "agent_proposal" || item.type === "slack_mirror" ? (
                <AgentBadge compact />
              ) : null}
            </div>
            <div className="type-base font-medium text-theme-text">{item.title}</div>
            <p className="type-sm mt-1 text-theme-text-sec">{item.body}</p>
            <div className="mt-v2 flex flex-wrap gap-2">
              {item.relatedIssueId ? (
                <Link
                  to={`/app/issues/${item.relatedIssueId}`}
                  className="btn-tertiary type-sm"
                >
                  Open issue
                </Link>
              ) : null}
              {item.relatedRunId ? (
                <Link to={`/app/runs/${item.relatedRunId}`} className="btn-tertiary type-sm">
                  Open run
                </Link>
              ) : null}
              {item.relatedChannelId ? (
                <Link
                  to={`/app/threads/${item.relatedChannelId}`}
                  className="btn-tertiary type-sm"
                >
                  Open thread
                </Link>
              ) : null}
              <button
                type="button"
                className="btn--quinary type-sm"
                onClick={() => markInboxRead(item.id, !item.read)}
              >
                {item.read ? "Mark unread" : "Mark read"}
              </button>
              <button
                type="button"
                className="btn--quinary type-sm text-theme-accent"
                onClick={() => dismissInbox(item.id)}
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
      {inbox.length === 0 ? (
        <p className="type-base text-theme-text-sec">Inbox zero — nice work.</p>
      ) : null}
    </div>
  );
}
