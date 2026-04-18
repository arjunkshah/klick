import { Check, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Issue, InboxItem, Priority, IssueState, TeamMember } from "../../data/types";
import { useKlickStore } from "../../data/store";

function issueRef(issue: Issue): string {
  const n = issue.id.replace(/\D/g, "") || "0";
  return `KLK-${n}`;
}

function formatState(state: IssueState): string {
  const labels: Record<IssueState, string> = {
    backlog: "Backlog",
    todo: "Todo",
    in_progress: "In progress",
    done: "Done",
    canceled: "Canceled",
  };
  return labels[state];
}

function priorityOrder(p: Priority): number {
  const o: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  return o[p];
}

function sortIssues(list: Issue[]): Issue[] {
  return [...list].sort((a, b) => {
    const pr = priorityOrder(a.priority) - priorityOrder(b.priority);
    if (pr !== 0) return pr;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function blockerRefs(issue: Issue, issueById: Map<string, Issue>): string {
  const refs = issue.blockedByIssueIds
    .map((id) => issueById.get(id))
    .filter((x): x is Issue => Boolean(x))
    .map((i) => issueRef(i));
  return refs.length ? refs.join(", ") : "—";
}

function InboxTypeBadge({ type }: { type: InboxItem["type"] }) {
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

function Avatar({ member }: { member: TeamMember | null }) {
  if (!member) {
    return <span className="today-avatar today-avatar--empty" title="Unassigned" />;
  }
  const initials = member.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="today-avatar" title={member.name}>
      {initials}
    </span>
  );
}

function IssuesTable({
  issues,
  membersById,
  issueById,
  showBlockersColumn,
}: {
  issues: Issue[];
  membersById: Map<string, TeamMember>;
  issueById: Map<string, Issue>;
  showBlockersColumn: boolean;
}) {
  if (issues.length === 0) {
    return <p className="today-empty">No issues in this view.</p>;
  }

  return (
    <div className="today-panel">
      <table className="today-table">
        <thead>
          <tr>
            <th className="today-table__th today-table__th--spacer" aria-hidden />
            <th className="today-table__th today-table__th--id">ID</th>
            <th className="today-table__th">Title</th>
            {showBlockersColumn ? (
              <th className="today-table__th today-table__th--blocked">Blocked by</th>
            ) : null}
            <th className="today-table__th today-table__th--status">Status</th>
            <th className="today-table__th today-table__th--priority">Priority</th>
            <th className="today-table__th today-table__th--assignee">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td className="today-table__td today-table__td--spacer">
                <span className="today-issue-checkbox" aria-hidden />
              </td>
              <td className="today-table__td today-table__td--id">
                <span className="today-id">{issueRef(issue)}</span>
              </td>
              <td className="today-table__td">
                <span className="today-cell-title">{issue.title}</span>
              </td>
              {showBlockersColumn ? (
                <td className="today-table__td today-table__td--blocked">
                  <span className="today-blocked-ref">{blockerRefs(issue, issueById)}</span>
                </td>
              ) : null}
              <td className="today-table__td today-table__td--status">
                <span className="today-status">{formatState(issue.state)}</span>
              </td>
              <td className="today-table__td today-table__td--priority">
                <span className={`today-priority today-priority--${issue.priority}`}>
                  <span className="today-priority__dot" aria-hidden />
                  <span className="capitalize">{issue.priority}</span>
                </span>
              </td>
              <td className="today-table__td today-table__td--assignee">
                <Avatar member={issue.assigneeId ? membersById.get(issue.assigneeId) ?? null : null} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function truncate(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Scannable bullet lines from live workspace signals (Dex-style). */
function computeDexSummaryBullets(params: {
  urgentOpen: Issue[];
  blockedCount: number;
  inboxUnread: number;
  agentInboxUnread: number;
  assignedCount: number;
  runningRuns: number;
  slackConnected: boolean;
  activeCount: number;
  highOpen: number;
}): string[] {
  const {
    urgentOpen,
    blockedCount,
    inboxUnread,
    agentInboxUnread,
    assignedCount,
    runningRuns,
    slackConnected,
    activeCount,
    highOpen,
  } = params;

  const bullets: string[] = [];

  if (urgentOpen.length > 0) {
    const refs = urgentOpen
      .slice(0, 3)
      .map((i) => issueRef(i))
      .join(", ");
    const more = urgentOpen.length > 3 ? ` (+${urgentOpen.length - 3} more)` : "";
    bullets.push(
      `Urgent — ${urgentOpen.length} open (${refs}${more}). Ship or escalate before you context-switch.`,
    );
  } else if (highOpen > 0) {
    bullets.push(
      `High priority — ${highOpen} issue${highOpen > 1 ? "s" : ""} open. Keep cycle dates visible so nothing slips.`,
    );
  }

  if (blockedCount > 0) {
    bullets.push(
      `Blocked — ${blockedCount} issue${blockedCount > 1 ? "s" : ""} ${blockedCount > 1 ? "depend" : "depends"} on upstream work. Unblock dependencies first.`,
    );
  }

  if (inboxUnread > 0) {
    const agent =
      agentInboxUnread > 0
        ? ` Includes ${agentInboxUnread} agent proposal${agentInboxUnread > 1 ? "s" : ""}.`
        : "";
    bullets.push(
      `Inbox — ${inboxUnread} unread.${agent} Triage mentions and approvals to shorten feedback loops.`,
    );
  }

  if (assignedCount > 0 && bullets.length < 6) {
    bullets.push(
      `Your queue — ${assignedCount} issue${assignedCount > 1 ? "s" : ""} assigned to you. Start with the smallest unblock.`,
    );
  }

  if (runningRuns > 0 && bullets.length < 6) {
    bullets.push(
      `Playbooks — ${runningRuns} run${runningRuns > 1 ? "s" : ""} in flight. Check Runs for steps waiting on approval.`,
    );
  }

  if (!slackConnected && bullets.length < 6) {
    bullets.push(
      `Integrations — Slack isn’t connected. Wire it up to mirror threads and surface approvals as they happen.`,
    );
  }

  if (bullets.length === 0) {
    return [
      `Status — ${activeCount} open issue${activeCount === 1 ? "" : "s"}, no dependency blockers, inbox clear.`,
      `Dex will list actionable bullets here when urgency, inbox volume, or playbook activity picks up.`,
    ];
  }

  return bullets.slice(0, 6);
}

export function TodayPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const profile = useKlickStore((s) => s.profile);
  const members = useKlickStore((s) => s.members);
  const projects = useKlickStore((s) => s.projects);
  const issues = useKlickStore((s) => s.issues);
  const inbox = useKlickStore((s) => s.inbox);
  const docs = useKlickStore((s) => s.docs);
  const runs = useKlickStore((s) => s.runs);

  const membersById = new Map(members.map((m) => [m.id, m]));
  const issueById = new Map(issues.map((i) => [i.id, i]));
  const youId = members.find((m) => m.email === profile.email)?.id ?? members[0]?.id ?? "";

  const active = issues.filter((i) => i.state !== "done" && i.state !== "canceled");
  const assignedToYou = sortIssues(active.filter((i) => i.assigneeId === youId));
  const teamActive = sortIssues(active.filter((i) => i.assigneeId !== youId));

  const blockedIssues = sortIssues(active.filter((i) => i.blockedByIssueIds.length > 0));

  const inboxUnread = inbox.filter((n) => !n.read).slice(0, 5);
  const inboxUnreadCount = inbox.filter((n) => !n.read).length;
  const agentInboxUnread = inbox.filter((n) => !n.read && n.type === "agent_proposal").length;

  const activeProjects = projects.filter((p) => p.status === "active");

  const sortedDocs = [...docs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const topDoc = sortedDocs[0];

  const agentActivity = issues
    .flatMap((issue) =>
      issue.comments
        .filter((c) => c.agent)
        .map((c) => ({ issue, body: c.body, at: c.createdAt })),
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  const cycleLabels = [...new Set(active.map((i) => i.cycle).filter(Boolean))] as string[];
  const primaryCycle = cycleLabels[0] ?? null;
  const inCycle = primaryCycle
    ? sortIssues(active.filter((i) => i.cycle === primaryCycle))
    : [];
  const inCycleInProgress = inCycle.filter((i) => i.state === "in_progress").length;

  const showAssignedBlockers = assignedToYou.some((i) => i.blockedByIssueIds.length > 0);
  const showTeamBlockers = teamActive.some((i) => i.blockedByIssueIds.length > 0);

  const slackDone = workspace.slackConnected;
  const projectDone = projects.length > 0;
  const runDone = runs.length > 0;
  const showOnboarding = !slackDone || !runDone || !projectDone;

  const urgentOpen = sortIssues(active.filter((i) => i.priority === "urgent"));
  const highOpen = active.filter((i) => i.priority === "high").length;
  const runningRuns = runs.filter((r) => r.status === "running").length;

  const dexBullets = computeDexSummaryBullets({
    urgentOpen,
    blockedCount: blockedIssues.length,
    inboxUnread: inboxUnreadCount,
    agentInboxUnread,
    assignedCount: assignedToYou.length,
    runningRuns,
    slackConnected: workspace.slackConnected,
    activeCount: active.length,
    highOpen,
  });

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="app-page">
      <div className="today-page">
        <header className="today-page__header">
          <p className="today-page__workspace">{workspace.name}</p>
          <div className="today-page__title-row">
            <h1 className="today-page__title">Today</h1>
            <time className="today-page__date" dateTime={new Date().toISOString()}>
              {dateLabel}
            </time>
          </div>
        </header>

        <section className="today-dex" aria-labelledby="today-dex-label">
          <div className="today-dex__bar">
            <div className="today-dex__main">
              <div className="today-dex__top">
                <span id="today-dex-label" className="today-dex__label">
                  Dex
                </span>
                <Link to="/app/dex" className="today-dex__link">
                  Open Dex
                </Link>
              </div>
              <ul className="today-dex__list">
                {dexBullets.map((line, i) => (
                  <li key={`${i}-${line.slice(0, 24)}`} className="today-dex__item">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {showOnboarding ? (
          <section className="today-section" aria-labelledby="today-onboard-heading">
            <div className="today-section__head">
              <h2 id="today-onboard-heading" className="today-section__label">
                Get started
              </h2>
              <span className="today-section__meta">First-time setup</span>
            </div>
            <div className="today-panel">
              <ul className="today-checklist">
                <li className="today-checklist__row">
                  <span className="today-checklist__label">
                    {slackDone ? (
                      <Check className="today-checklist__icon today-checklist__icon--done" size={16} strokeWidth={2} aria-hidden />
                    ) : (
                      <Circle className="today-checklist__icon" size={16} strokeWidth={1.75} aria-hidden />
                    )}
                    Connect Slack
                  </span>
                  {slackDone ? (
                    <span className="today-section__meta">Done</span>
                  ) : (
                    <Link to="/app/integrations" className="today-checklist__action">
                      Open integrations
                    </Link>
                  )}
                </li>
                <li className="today-checklist__row">
                  <span className="today-checklist__label">
                    {projectDone ? (
                      <Check className="today-checklist__icon today-checklist__icon--done" size={16} strokeWidth={2} aria-hidden />
                    ) : (
                      <Circle className="today-checklist__icon" size={16} strokeWidth={1.75} aria-hidden />
                    )}
                    Create a project
                  </span>
                  {projectDone ? (
                    <span className="today-section__meta">Done</span>
                  ) : (
                    <Link to="/app/projects" className="today-checklist__action">
                      New project
                    </Link>
                  )}
                </li>
                <li className="today-checklist__row">
                  <span className="today-checklist__label">
                    {runDone ? (
                      <Check className="today-checklist__icon today-checklist__icon--done" size={16} strokeWidth={2} aria-hidden />
                    ) : (
                      <Circle className="today-checklist__icon" size={16} strokeWidth={1.75} aria-hidden />
                    )}
                    Run a playbook
                  </span>
                  {runDone ? (
                    <span className="today-section__meta">Done</span>
                  ) : (
                    <Link to="/app/playbooks" className="today-checklist__action">
                      View playbooks
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </section>
        ) : null}

        <section className="today-section" aria-labelledby="today-digest-heading">
          <div className="today-section__head">
            <h2 id="today-digest-heading" className="today-section__label">
              Digest
            </h2>
            <span className="today-section__meta">What changed · team pulse</span>
          </div>
          <div className="today-panel">
            <ul className="today-digest">
              <li className="today-digest__item">
                <span className="today-digest__bullet" aria-hidden />
                <span className="today-digest__text">
                  <strong>{active.length}</strong> open issues across{" "}
                  <strong>{activeProjects.length}</strong> active{" "}
                  <Link to="/app/projects" className="today-link">
                    projects
                  </Link>
                  .
                </span>
              </li>
              <li className="today-digest__item">
                <span className="today-digest__bullet" aria-hidden />
                <span className="today-digest__text">
                  <strong>{docs.length}</strong> docs in the workspace
                  {topDoc ? (
                    <>
                      {" "}
                      · Latest:{" "}
                      <Link to="/app/docs" className="today-link">
                        {topDoc.title}
                      </Link>
                    </>
                  ) : null}
                  .
                </span>
              </li>
              <li className="today-digest__item">
                <span className="today-digest__bullet" aria-hidden />
                <span className="today-digest__text">
                  {runs.length === 0 ? (
                    <>
                      No playbook runs yet — start one from{" "}
                      <Link to="/app/playbooks" className="today-link">
                        Playbooks
                      </Link>{" "}
                      (history in{" "}
                      <Link to="/app/runs" className="today-link">
                        Runs
                      </Link>
                      ).
                    </>
                  ) : (
                    <>
                      <strong>{runs.length}</strong> playbook {runs.length === 1 ? "run" : "runs"} logged —{" "}
                      <Link to="/app/runs" className="today-link">
                        open Runs
                      </Link>
                      .
                    </>
                  )}
                </span>
              </li>
              {inboxUnreadCount > 0 ? (
                <li className="today-digest__item">
                  <span className="today-digest__bullet" aria-hidden />
                  <span className="today-digest__text">
                    <strong>{inboxUnreadCount}</strong> inbox{" "}
                    {inboxUnreadCount === 1 ? "item" : "items"} need attention —{" "}
                    <Link to="/app/inbox" className="today-link">
                      triage
                    </Link>
                    .
                  </span>
                </li>
              ) : (
                <li className="today-digest__item">
                  <span className="today-digest__bullet" aria-hidden />
                  <span className="today-digest__text">Inbox is clear — you&apos;re caught up on notifications.</span>
                </li>
              )}
            </ul>
          </div>
        </section>

        {blockedIssues.length > 0 ? (
          <section className="today-section" aria-labelledby="today-blocked-heading">
            <div className="today-section__head">
              <h2 id="today-blocked-heading" className="today-section__label">
                Blocked
              </h2>
              <span className="today-section__meta">{blockedIssues.length} with dependencies</span>
            </div>
            <IssuesTable
              issues={blockedIssues}
              membersById={membersById}
              issueById={issueById}
              showBlockersColumn
            />
          </section>
        ) : null}

        <section className="today-section" aria-labelledby="today-assigned-heading">
          <div className="today-section__head">
            <h2 id="today-assigned-heading" className="today-section__label">
              Assigned to you
            </h2>
            <div className="today-section__actions">
              <span className="today-section__meta">{assignedToYou.length} issues</span>
              <Link to="/app/issues" className="today-link">
                Open Issues
              </Link>
            </div>
          </div>
          <IssuesTable
            issues={assignedToYou}
            membersById={membersById}
            issueById={issueById}
            showBlockersColumn={showAssignedBlockers}
          />
        </section>

        {inboxUnread.length > 0 ? (
          <section className="today-section" aria-labelledby="today-inbox-heading">
            <div className="today-section__head">
              <h2 id="today-inbox-heading" className="today-section__label">
                Inbox
              </h2>
              <Link to="/app/inbox" className="today-link">
                View all
              </Link>
            </div>
            <div className="today-panel">
              {inboxUnread.map((item) => (
                <div key={item.id} className="today-inbox-row">
                  <div>
                    <div className="today-inbox-row__title">{item.title}</div>
                    <p className="today-inbox-row__body">{item.body}</p>
                  </div>
                  <InboxTypeBadge type={item.type} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {agentActivity.length > 0 ? (
          <section className="today-section" aria-labelledby="today-agent-heading">
            <div className="today-section__head">
              <h2 id="today-agent-heading" className="today-section__label">
                Agent activity
              </h2>
              <span className="today-section__meta">What agents did</span>
            </div>
            <div className="today-panel">
              {agentActivity.map(({ issue, body }, idx) => (
                <div key={`${issue.id}-${idx}`} className="today-agent-row">
                  <span className="today-agent-row__badge">Agent</span>
                  <div className="today-agent-row__main">
                    <div className="today-agent-row__issue">
                      {issueRef(issue)} · {issue.title}
                    </div>
                    <p className="today-agent-row__body">{truncate(body, 200)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {primaryCycle && inCycle.length > 0 ? (
          <section className="today-section" aria-labelledby="today-cycle-heading">
            <div className="today-section__head">
              <h2 id="today-cycle-heading" className="today-section__label">
                This cycle
              </h2>
              <Link to="/app/issues" className="today-link">
                Issues
              </Link>
            </div>
            <div className="today-cycle-bar">
              <span className="today-cycle-bar__label">{primaryCycle}</span>
              <span className="today-cycle-bar__meta">
                {inCycle.length} issues · {inCycleInProgress} in progress
              </span>
            </div>
            <IssuesTable
              issues={inCycle}
              membersById={membersById}
              issueById={issueById}
              showBlockersColumn={inCycle.some((i) => i.blockedByIssueIds.length > 0)}
            />
          </section>
        ) : null}

        <section className="today-section" aria-labelledby="today-team-heading">
          <div className="today-section__head">
            <h2 id="today-team-heading" className="today-section__label">
              Team issues
            </h2>
            <span className="today-section__meta">{teamActive.length} active</span>
          </div>
          <IssuesTable
            issues={teamActive}
            membersById={membersById}
            issueById={issueById}
            showBlockersColumn={showTeamBlockers}
          />
        </section>
      </div>
    </div>
  );
}
