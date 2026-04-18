import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function TodayPage() {
  const issues = useKlickStore((s) => s.issues);
  const inbox = useKlickStore((s) => s.inbox);
  const runs = useKlickStore((s) => s.runs);
  const tasks = useKlickStore((s) => s.tasks);
  const messages = useKlickStore((s) => s.messages);
  const workspace = useKlickStore((s) => s.workspace);
  const channels = useKlickStore((s) => s.channels);

  const active = issues.filter((i) => i.state === "in_progress" || i.state === "todo");
  const unread = inbox.filter((i) => !i.read).length;
  const running = runs.filter((r) => r.status === "running");
  const openTasks = tasks.filter((t) => !t.done);
  const recentThreads = [...messages]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="bg-transparent text-theme-text">
      <div className="container w-full max-w-none pb-v5 pt-v4 md:pb-v6 md:pt-v5">
        <header className="mb-v4 max-w-prose-medium-wide md:mb-v5">
          <p className="type-product-sm mb-v8/12 font-medium uppercase tracking-[0.08em] text-theme-text-tertiary">
            Overview
          </p>
          <h1 className="type-md mb-v1 text-balance tracking-[var(--tracking-lg)]">Today</h1>
          <p className="type-base max-w-[52ch] leading-relaxed text-pretty text-theme-text-sec">
            {workspace.name} — a calm digest across issues, threads, tasks, and agents.
          </p>
          <Link
            to="/app/dex"
            className="card card--feature card--large mt-v3 block no-underline"
          >
            <div className="type-base leading-snug text-pretty">
              <span className="font-semibold text-theme-text">Dex</span>
              <span className="text-theme-text-sec">
                {" "}
                — workspace superagent on{" "}
                <span className="type-product-sm text-theme-text-mid">openai/gpt-oss-120b</span>
                {" · "}
                search and draft across your data.
              </span>
            </div>
            <div className="mt-v1">
              <span className="btn-tertiary type-sm">Open Dex →</span>
            </div>
          </Link>
        </header>

        <div className="klick-metric-grid klick-stagger mb-v4 md:mb-v5">
          <div className="card card--large flex min-h-[8.75rem] flex-col justify-between">
            <div>
              <div className="type-product-sm font-medium uppercase tracking-[0.07em] text-theme-text-tertiary">
                Inbox
              </div>
              <div className="mt-2 tabular-nums text-[clamp(2rem,3.6vw,2.85rem)] font-semibold leading-[1.06] tracking-[var(--tracking-lg)] text-theme-text">
                {unread}
              </div>
            </div>
            <Link to="/app/inbox" className="btn-tertiary type-sm mt-4 inline-flex self-start">
              Triage →
            </Link>
          </div>
          <div className="card card--large flex min-h-[8.75rem] flex-col justify-between">
            <div>
              <div className="type-product-sm font-medium uppercase tracking-[0.07em] text-theme-text-tertiary">
                Active issues
              </div>
              <div className="mt-2 tabular-nums text-[clamp(2rem,3.6vw,2.85rem)] font-semibold leading-[1.06] tracking-[var(--tracking-lg)] text-theme-text">
                {active.length}
              </div>
            </div>
            <Link to="/app/issues" className="btn-tertiary type-sm mt-4 inline-flex self-start">
              Work queue →
            </Link>
          </div>
          <div className="card card--large flex min-h-[8.75rem] flex-col justify-between">
            <div>
              <div className="type-product-sm font-medium uppercase tracking-[0.07em] text-theme-text-tertiary">
                Open tasks
              </div>
              <div className="mt-2 tabular-nums text-[clamp(2rem,3.6vw,2.85rem)] font-semibold leading-[1.06] tracking-[var(--tracking-lg)] text-theme-text">
                {openTasks.length}
              </div>
            </div>
            <Link to="/app/tasks" className="btn-tertiary type-sm mt-4 inline-flex self-start">
              Checklists →
            </Link>
          </div>
          <div className="card card--large flex min-h-[8.75rem] flex-col justify-between">
            <div>
              <div className="type-product-sm font-medium uppercase tracking-[0.07em] text-theme-text-tertiary">
                Runs in flight
              </div>
              <div className="mt-2 tabular-nums text-[clamp(2rem,3.6vw,2.85rem)] font-semibold leading-[1.06] tracking-[var(--tracking-lg)] text-theme-text">
                {running.length}
              </div>
            </div>
            <Link to="/app/runs" className="btn-tertiary type-sm mt-4 inline-flex self-start">
              Audit →
            </Link>
          </div>
        </div>

        <div className="klick-stagger grid grid-cols-1 gap-v3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-0">
          <div className="card card--large">
            <h2 className="type-base font-semibold text-pretty text-theme-text lg:type-md">Latest in threads</h2>
            <p className="type-sm mt-v8/12 max-w-prose text-theme-text-sec">
              Recent messages across your channels.
            </p>
            <ul className="klick-thread-list">
              {recentThreads.map((m) => {
                const ch = channels.find((c) => c.id === m.channelId);
                return (
                  <li key={m.id} className="type-base">
                    <Link
                      to={`/app/threads/${m.channelId}`}
                      className="font-medium text-theme-accent no-underline transition-opacity duration-[var(--duration)] hover:opacity-85"
                    >
                      #{ch?.name ?? "channel"}
                    </Link>
                    <span className="text-theme-text-sec"> — {m.body.slice(0, 72)}…</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-v2">
              <Link to="/app/threads" className="btn-tertiary type-sm">
                All channels →
              </Link>
            </div>
          </div>
          <div className="card card--large">
            <h2 className="type-base font-semibold text-pretty text-theme-text lg:type-md">Quick checklist</h2>
            <p className="type-sm mt-v8/12 max-w-prose text-theme-text-sec">
              A short path to feeling at home in the workspace.
            </p>
            <ul className="klick-checklist mt-v1">
              <li className={workspace.slackConnected ? "line-through opacity-55" : ""}>
                Connect Slack in{" "}
                <Link to="/app/integrations" className="text-theme-accent no-underline hover:underline">
                  Integrations
                </Link>
              </li>
              <li>
                Say hi in{" "}
                <Link to="/app/threads" className="text-theme-accent no-underline hover:underline">
                  Threads
                </Link>
              </li>
              <li>
                Ask{" "}
                <Link to="/app/dex" className="text-theme-accent no-underline hover:underline">
                  Dex
                </Link>{" "}
                anything about your data
              </li>
              <li>
                Run a playbook from{" "}
                <Link to="/app/playbooks" className="text-theme-accent no-underline hover:underline">
                  Playbooks
                </Link>
              </li>
              <li>
                Link a doc to an issue in{" "}
                <Link to="/app/issues" className="text-theme-accent no-underline hover:underline">
                  Issues
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
