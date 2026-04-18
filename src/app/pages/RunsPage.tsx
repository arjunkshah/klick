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

  return (
    <div className="app-page hub-page">
      <div className="today-page work-page work-page--wide">
        <header className="today-page__header">
          <p className="today-page__workspace">{workspace.name}</p>
          <div className="today-page__title-row">
            <h1 className="today-page__title">Runs</h1>
            <Link to="/app/playbooks" className="today-link">
              Playbooks
            </Link>
          </div>
          <p className="hub-lede">
            Step through <strong>human</strong> checkpoints and <strong>agent</strong> drafts. Approve or reject agent
            output to keep quality high.
          </p>
        </header>

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

        <div className="hub-split">
          <aside className="hub-split__aside thin-scrollbar" aria-label="Run history">
            {filtered.length === 0 ? (
              <div className="hub-empty hub-empty--compact">
                <PlayCircle className="hub-empty__icon" size={26} strokeWidth={1.5} aria-hidden />
                <p className="hub-empty__title">No runs here</p>
                <p className="hub-empty__text">Start one from Playbooks.</p>
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
            {selected ? (
              <div className="hub-panel">
                <div className="hub-panel__head hub-panel__head--runs">
                  <div>
                    <h2 className="hub-run-title">{selected.playbookName}</h2>
                    <p className="hub-run-sub">
                      Started {formatWhen(selected.startedAt)}
                      {selected.completedAt ? ` · Finished ${formatWhen(selected.completedAt)}` : null}
                    </p>
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
            ) : (
              <div className="hub-panel hub-panel--muted">
                <p className="hub-placeholder">Select a run to inspect steps.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
