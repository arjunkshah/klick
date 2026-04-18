import { Check, Circle, PlayCircle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { PlaybookRun, RunStepLog } from "../../data/types";
import { useKlickStore } from "../../data/store";

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusLabel(s: PlaybookRun["status"]): string {
  if (s === "running") return "Running";
  if (s === "completed") return "Completed";
  return "Cancelled";
}

function StepStatusIcon({ log }: { log: RunStepLog }) {
  if (log.status === "completed") {
    return <Check className="hub-step-status hub-step-status--done" size={16} strokeWidth={2} aria-hidden />;
  }
  if (log.status === "awaiting_approval") {
    return <Circle className="hub-step-status hub-step-status--wait" size={16} strokeWidth={1.75} aria-hidden />;
  }
  if (log.status === "running") {
    return <Circle className="hub-step-status hub-step-status--run" size={16} strokeWidth={1.75} aria-hidden />;
  }
  return <Circle className="hub-step-status hub-step-status--pending" size={16} strokeWidth={1.75} aria-hidden />;
}

export function RunsPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const runs = useKlickStore((s) => s.runs);
  const advanceRun = useKlickStore((s) => s.advanceRun);
  const cancelRun = useKlickStore((s) => s.cancelRun);

  const [params, setParams] = useSearchParams();
  const paramRun = params.get("r");
  const [filter, setFilter] = useState<"all" | "running" | "completed" | "cancelled">("all");

  const sorted = useMemo(
    () => [...runs].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
    [runs],
  );

  const hubStats = useMemo(() => {
    const running = runs.filter((r) => r.status === "running").length;
    const completed = runs.filter((r) => r.status === "completed").length;
    return { running, completed };
  }, [runs]);

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((r) => r.status === filter);
  }, [sorted, filter]);

  const selected = useMemo(() => {
    if (paramRun) return sorted.find((r) => r.id === paramRun) ?? null;
    return filtered[0] ?? sorted[0] ?? null;
  }, [paramRun, sorted, filtered]);

  useEffect(() => {
    if (!paramRun || sorted.some((r) => r.id === paramRun)) return;
    setParams({}, { replace: true });
  }, [paramRun, sorted, setParams]);

  const selectRun = useCallback(
    (id: string) => {
      setParams({ r: id }, { replace: true });
    },
    [setParams],
  );

  const selectedProgress = useMemo(() => {
    if (!selected) return null;
    const doneSteps = selected.stepLogs.filter((l) => l.status === "completed").length;
    const totalSteps = selected.stepLogs.length;
    const pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;
    return { doneSteps, totalSteps, pct };
  }, [selected]);

  return (
    <div className="app-page hub-page">
      <div className="today-page work-page work-page--wide">
        <header className="today-page__header">
          <div className="hub-hero">
            <p className="today-page__workspace">{workspace.name}</p>
            <div className="hub-hero__top">
              <div className="hub-hero__title-wrap">
                <h1 className="today-page__title">Runs</h1>
                <p className="hub-lede">
                  Step through <strong>human</strong> checkpoints and <strong>agent</strong> drafts. Approve or
                  regenerate agent output before it ships.
                </p>
              </div>
              <nav className="hub-pill-nav" aria-label="Automation">
                <Link to="/app/playbooks" className="hub-pill-nav__item">
                  Playbooks
                </Link>
                <span className="hub-pill-nav__item hub-pill-nav__item--current">Runs</span>
                <Link to="/app/inbox" className="hub-pill-nav__item">
                  Inbox
                </Link>
              </nav>
            </div>
            <ul className="hub-stats" aria-label="Runs overview">
              <li className="hub-stats__item">
                <span className="hub-stats__value">{sorted.length}</span>
                <span className="hub-stats__label">All runs</span>
              </li>
              <li className="hub-stats__item">
                <span className="hub-stats__value">{hubStats.running}</span>
                <span className="hub-stats__label">Active</span>
              </li>
              <li className="hub-stats__item">
                <span className="hub-stats__value">{hubStats.completed}</span>
                <span className="hub-stats__label">Completed</span>
              </li>
            </ul>
          </div>
        </header>

        <div className="hub-filter-bar">
          <div className="hub-filters" role="tablist" aria-label="Filter runs">
            {(
              [
                ["all", "All"],
                ["running", "Running"],
                ["completed", "Done"],
                ["cancelled", "Cancelled"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className={`hub-filter${filter === key ? " hub-filter--active" : ""}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="hub-split">
          <aside className="hub-split__aside thin-scrollbar" aria-label="Run history">
            <div className="hub-aside-head">
              <h3 className="hub-aside-head__title">History</h3>
              <span className="hub-aside-head__badge">{filtered.length}</span>
            </div>
            {filtered.length === 0 ? (
              <div className="hub-empty hub-empty--compact">
                <div className="hub-empty__icon-wrap">
                  <PlayCircle className="hub-empty__icon" size={22} strokeWidth={1.5} aria-hidden />
                </div>
                <p className="hub-empty__title">Nothing in this filter</p>
                <p className="hub-empty__text">Try another tab, or start a fresh run from your playbooks.</p>
                <Link to="/app/playbooks" className="work-btn work-btn--primary">
                  Open playbooks
                </Link>
              </div>
            ) : (
              <ul className="hub-list" role="list">
                {filtered.map((run) => {
                  const sel = run.id === selected?.id;
                  const done = run.stepLogs.filter((l) => l.status === "completed").length;
                  return (
                    <li key={run.id}>
                      <button
                        type="button"
                        className={`hub-list-item${sel ? " hub-list-item--active" : ""}`}
                        onClick={() => selectRun(run.id)}
                      >
                        <span className="hub-list-item__title">{run.playbookName}</span>
                        <span className="hub-list-item__meta">
                          <span className={`hub-run-badge hub-run-badge--${run.status}`}>{statusLabel(run.status)}</span>
                          · {done}/{run.stepLogs.length} steps · {formatWhen(run.startedAt)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="hub-split__main" aria-label="Run detail">
            {selected && selectedProgress ? (
              <div className="hub-panel hub-panel--editor">
                <div className="hub-run-head">
                  <div className="hub-run-head__text">
                    <div className="hub-run-title-row">
                      <h2 className="hub-run-title">{selected.playbookName}</h2>
                      <span className={`hub-run-badge hub-run-badge--${selected.status}`}>
                        {statusLabel(selected.status)}
                      </span>
                    </div>
                    <p className="hub-run-sub">
                      Started {formatWhen(selected.startedAt)}
                      {selected.completedAt ? ` · Finished ${formatWhen(selected.completedAt)}` : null}
                    </p>
                    <div
                      className="hub-run-progress"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={selectedProgress.pct}
                      aria-label="Run progress"
                    >
                      <div className="hub-run-progress__track">
                        <div
                          className="hub-run-progress__fill"
                          style={{ width: `${selectedProgress.pct}%` }}
                        />
                      </div>
                      <p className="hub-run-progress__label">
                        {selectedProgress.doneSteps} of {selectedProgress.totalSteps} steps complete
                      </p>
                    </div>
                  </div>
                  {selected.status === "running" ? (
                    <button
                      type="button"
                      className="work-btn work-btn--danger"
                      onClick={() => cancelRun(selected.id)}
                    >
                      Cancel run
                    </button>
                  ) : null}
                </div>

                <ol className="hub-run-steps">
                  {selected.stepLogs.map((log, idx) => {
                    const isCurrent = selected.status === "running" && idx === selected.currentStepIndex;
                    return (
                      <li
                        key={`${log.stepId}-${idx}`}
                        className={`hub-run-step${isCurrent ? " hub-run-step--current" : ""}`}
                      >
                        <div className="hub-run-step__glyph">
                          <StepStatusIcon log={log} />
                        </div>
                        <div className="hub-run-step__body">
                          <div className="hub-run-step__top">
                            <span className="hub-run-step__title">{log.title}</span>
                            <span className={`hub-pill hub-pill--${log.type === "agent" ? "agent" : "human"}`}>
                              {log.type === "agent" ? "Agent" : "Human"}
                            </span>
                          </div>
                          <p className="hub-run-step__status">
                            {log.status === "completed" && log.approvedAt
                              ? `Approved ${formatWhen(log.approvedAt)}`
                              : log.status.replace(/_/g, " ")}
                          </p>
                          {log.output ? (
                            <pre className="hub-run-output thin-scrollbar">{log.output}</pre>
                          ) : null}

                          {isCurrent && selected.status === "running" ? (
                            <div className="hub-run-actions">
                              {log.type === "human" && log.status === "pending" ? (
                                <button
                                  type="button"
                                  className="work-btn work-btn--primary"
                                  onClick={() => advanceRun(selected.id, "complete_human")}
                                >
                                  Mark complete
                                </button>
                              ) : null}
                              {log.type === "agent" && log.status === "awaiting_approval" ? (
                                <>
                                  <button
                                    type="button"
                                    className="work-btn work-btn--primary"
                                    onClick={() => advanceRun(selected.id, "approve_agent")}
                                  >
                                    <Check size={15} strokeWidth={1.75} aria-hidden />
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="work-btn"
                                    onClick={() => advanceRun(selected.id, "reject_agent")}
                                  >
                                    <X size={15} strokeWidth={1.75} aria-hidden />
                                    Regenerate
                                  </button>
                                </>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : sorted.length === 0 ? (
              <div className="hub-panel hub-panel--muted">
                <p className="hub-placeholder">No runs yet.</p>
                <p className="hub-placeholder__sub">Start a playbook to see live steps, approvals, and agent output here.</p>
                <Link to="/app/playbooks" className="work-btn work-btn--primary">
                  Browse playbooks
                </Link>
              </div>
            ) : (
              <div className="hub-panel hub-panel--muted">
                <p className="hub-placeholder">Select a run on the left to open the timeline.</p>
                <p className="hub-placeholder__sub">Active steps surface actions like approve, regenerate, or mark human work complete.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
