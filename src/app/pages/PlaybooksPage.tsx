import { BookOpen, Copy, Play, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AutonomyLevel, Playbook, PlaybookStep, PlaybookStepType } from "../../data/types";
import { useKlickStore } from "../../data/store";

function formatUpdated(iso: string): string {
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

function StepTypeBadge({ type }: { type: PlaybookStepType }) {
  return (
    <span className={`hub-pill hub-pill--${type === "agent" ? "agent" : "human"}`}>
      {type === "agent" ? "Agent" : "Human"}
    </span>
  );
}

export function PlaybooksPage() {
  const navigate = useNavigate();
  const workspace = useKlickStore((s) => s.workspace);
  const playbooks = useKlickStore((s) => s.playbooks);
  const addPlaybook = useKlickStore((s) => s.addPlaybook);
  const updatePlaybook = useKlickStore((s) => s.updatePlaybook);
  const removePlaybook = useKlickStore((s) => s.removePlaybook);
  const startRun = useKlickStore((s) => s.startRun);
  const seedStarterPlaybooks = useKlickStore((s) => s.seedStarterPlaybooks);
  const runs = useKlickStore((s) => s.runs);

  const [draftName, setDraftName] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...playbooks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [playbooks],
  );

  const hubStats = useMemo(() => {
    const totalSteps = playbooks.reduce((acc, p) => acc + p.steps.length, 0);
    const running = runs.filter((r) => r.status === "running").length;
    return { totalSteps, running };
  }, [playbooks, runs]);

  const resolvedSelectedId = useMemo(() => {
    if (selectedId != null && sorted.some((p) => p.id === selectedId)) return selectedId;
    return sorted[0]?.id ?? null;
  }, [sorted, selectedId]);

  const selected = useMemo(
    () =>
      resolvedSelectedId != null ? sorted.find((p) => p.id === resolvedSelectedId) ?? null : null,
    [sorted, resolvedSelectedId],
  );

  const canDelete = useCallback(
    (pb: Playbook) => !runs.some((r) => r.playbookId === pb.id && r.status === "running"),
    [runs],
  );

  const duplicatePlaybook = useCallback(
    (pb: Playbook) => {
      const nid = addPlaybook(`${pb.name} (copy)`, pb.description);
      const created = useKlickStore.getState().playbooks.find((p) => p.id === nid);
      if (created) {
        updatePlaybook(nid, {
          steps: pb.steps.map((s) => ({
            ...s,
            id: crypto.randomUUID(),
          })),
        });
      }
      setSelectedId(nid);
    },
    [addPlaybook, updatePlaybook],
  );

  const addStep = useCallback(
    (pb: Playbook) => {
      const step: PlaybookStep = {
        id: crypto.randomUUID(),
        type: "human",
        title: "New step",
        description: "",
        autonomy: null,
      };
      updatePlaybook(pb.id, { steps: [...pb.steps, step] });
    },
    [updatePlaybook],
  );

  const patchStep = useCallback(
    (pb: Playbook, stepId: string, patch: Partial<PlaybookStep>) => {
      updatePlaybook(pb.id, {
        steps: pb.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
      });
    },
    [updatePlaybook],
  );

  const removeStep = useCallback(
    (pb: Playbook, stepId: string) => {
      if (pb.steps.length <= 1) return;
      updatePlaybook(pb.id, { steps: pb.steps.filter((s) => s.id !== stepId) });
    },
    [updatePlaybook],
  );

  return (
    <div className="app-page hub-page">
      <div className="today-page work-page work-page--wide">
        <header className="today-page__header">
          <div className="hub-hero">
            <p className="today-page__workspace">{workspace.name}</p>
            <div className="hub-hero__top">
              <div className="hub-hero__title-wrap">
                <h1 className="today-page__title">Playbooks</h1>
                <p className="hub-lede">
                  Reusable human + agent workflows. Start a <strong>run</strong> anytime—progress and approvals land in{" "}
                  <Link to="/app/inbox" className="today-link">
                    Inbox
                  </Link>
                  .
                </p>
              </div>
              <nav className="hub-pill-nav" aria-label="Automation">
                <span className="hub-pill-nav__item hub-pill-nav__item--current">Playbooks</span>
                <Link to="/app/runs" className="hub-pill-nav__item">
                  Runs
                </Link>
                <Link to="/app/inbox" className="hub-pill-nav__item">
                  Inbox
                </Link>
              </nav>
            </div>
            <ul className="hub-stats" aria-label="Playbooks overview">
              <li className="hub-stats__item">
                <span className="hub-stats__value">{sorted.length}</span>
                <span className="hub-stats__label">Playbooks</span>
              </li>
              <li className="hub-stats__item">
                <span className="hub-stats__value">{hubStats.totalSteps}</span>
                <span className="hub-stats__label">Total steps</span>
              </li>
              <li className="hub-stats__item">
                <span className="hub-stats__value">{hubStats.running}</span>
                <span className="hub-stats__label">Runs live</span>
              </li>
            </ul>
          </div>
        </header>

        <div className="hub-split">
          <aside className="hub-split__aside thin-scrollbar" aria-label="Playbook list">
            <div className="hub-compose">
              <h3 className="hub-compose__title">New playbook</h3>
              <p className="hub-compose__hint">Give it a clear name. You will refine steps in the editor on the right.</p>
              <div className="hub-toolbar hub-toolbar--stack">
                <input
                  type="text"
                  className="hub-input"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g. Weekly product review"
                  aria-label="New playbook name"
                />
                <input
                  type="text"
                  className="hub-input"
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  placeholder="One-line purpose (optional)"
                  aria-label="New playbook description"
                />
                <button
                  type="button"
                  className="work-btn work-btn--primary hub-toolbar__btn"
                  disabled={!draftName.trim()}
                  onClick={() => {
                    const pid = addPlaybook(draftName, draftDesc);
                    setDraftName("");
                    setDraftDesc("");
                    setSelectedId(pid);
                  }}
                >
                  <Plus size={16} strokeWidth={1.65} aria-hidden />
                  Create playbook
                </button>
              </div>
            </div>

            <div className="hub-aside-head">
              <h3 className="hub-aside-head__title">Library</h3>
              <span className="hub-aside-head__badge">{sorted.length}</span>
            </div>

            {sorted.length === 0 ? (
              <div className="hub-empty">
                <div className="hub-empty__icon-wrap">
                  <BookOpen className="hub-empty__icon" size={22} strokeWidth={1.5} aria-hidden />
                </div>
                <p className="hub-empty__title">No playbooks yet</p>
                <p className="hub-empty__text">Create your first workflow above, or load two curated starters to explore the editor.</p>
                <button type="button" className="work-btn work-btn--primary" onClick={() => seedStarterPlaybooks()}>
                  Add starter playbooks
                </button>
              </div>
            ) : (
              <ul className="hub-list" role="list">
                {sorted.map((pb) => {
                  const sel = pb.id === resolvedSelectedId;
                  return (
                    <li key={pb.id}>
                      <button
                        type="button"
                        className={`hub-list-item${sel ? " hub-list-item--active" : ""}`}
                        onClick={() => setSelectedId(pb.id)}
                      >
                        <span className="hub-list-item__title">{pb.name}</span>
                        <span className="hub-list-item__meta">
                          {pb.steps.length} step{pb.steps.length === 1 ? "" : "s"} · {formatUpdated(pb.updatedAt)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="hub-split__main" aria-label="Playbook editor">
            {selected ? (
              <div className="hub-panel hub-panel--editor">
                <div className="hub-panel__head">
                  <div className="hub-panel__head-text">
                    <label className="hub-field-label" htmlFor="pb-name">
                      Name
                    </label>
                    <input
                      id="pb-name"
                      className="hub-input hub-input--lg"
                      value={selected.name}
                      onChange={(e) => updatePlaybook(selected.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="hub-panel__actions">
                    <button
                      type="button"
                      className="work-btn"
                      title="Duplicate"
                      onClick={() => duplicatePlaybook(selected)}
                    >
                      <Copy size={15} strokeWidth={1.65} aria-hidden />
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className="work-btn work-btn--primary"
                      onClick={() => {
                        const rid = startRun(selected.id);
                        if (rid) navigate(`/app/runs?r=${encodeURIComponent(rid)}`);
                      }}
                    >
                      <Play size={15} strokeWidth={1.65} aria-hidden />
                      Start run
                    </button>
                    <button
                      type="button"
                      className="work-btn work-btn--danger"
                      disabled={!canDelete(selected)}
                      title={canDelete(selected) ? "Delete playbook" : "Finish running instances first"}
                      onClick={() => {
                        removePlaybook(selected.id);
                        setSelectedId(null);
                      }}
                    >
                      <Trash2 size={15} strokeWidth={1.65} aria-hidden />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="hub-panel-meta">
                  <span>
                    {selected.steps.length} step{selected.steps.length === 1 ? "" : "s"}
                  </span>
                  <span className="hub-panel-meta__dot" aria-hidden>
                    ·
                  </span>
                  <span>Updated {formatUpdated(selected.updatedAt)}</span>
                </div>

                <label className="hub-field-label" htmlFor="pb-desc">
                  Description
                </label>
                <textarea
                  id="pb-desc"
                  className="hub-textarea"
                  rows={2}
                  value={selected.description}
                  onChange={(e) => updatePlaybook(selected.id, { description: e.target.value })}
                />

                <div className="hub-section-head">
                  <h2 className="hub-section-title">Steps</h2>
                  <button type="button" className="work-btn" onClick={() => addStep(selected)}>
                    <Plus size={15} strokeWidth={1.65} aria-hidden />
                    Add step
                  </button>
                </div>

                <ol className="hub-steps">
                  {selected.steps.map((step, idx) => (
                    <li
                      key={step.id}
                      className={`hub-step-card${step.type === "human" ? " hub-step-card--human" : ""}`}
                    >
                      <div className="hub-step-card__bar">
                        <span className="hub-step-card__index">{idx + 1}</span>
                        <StepTypeBadge type={step.type} />
                        <select
                          className="hub-select hub-select--narrow"
                          value={step.type}
                          onChange={(e) => {
                            const type = e.target.value as PlaybookStepType;
                            patchStep(selected, step.id, {
                              type,
                              autonomy: type === "agent" ? "draft" : null,
                            });
                          }}
                          aria-label={`Step ${idx + 1} type`}
                        >
                          <option value="human">Human</option>
                          <option value="agent">Agent</option>
                        </select>
                        {step.type === "agent" ? (
                          <select
                            className="hub-select"
                            value={step.autonomy ?? "suggest"}
                            onChange={(e) =>
                              patchStep(selected, step.id, {
                                autonomy: e.target.value as AutonomyLevel,
                              })
                            }
                            aria-label={`Step ${idx + 1} autonomy`}
                          >
                            <option value="suggest">Suggest</option>
                            <option value="draft">Draft</option>
                            <option value="run">Run</option>
                          </select>
                        ) : null}
                        <button
                          type="button"
                          className="hub-icon-btn"
                          title="Remove step"
                          disabled={selected.steps.length <= 1}
                          onClick={() => removeStep(selected, step.id)}
                        >
                          <Trash2 size={15} strokeWidth={1.65} aria-hidden />
                        </button>
                      </div>
                      <input
                        type="text"
                        className="hub-input"
                        value={step.title}
                        onChange={(e) => patchStep(selected, step.id, { title: e.target.value })}
                        aria-label={`Step ${idx + 1} title`}
                      />
                      <textarea
                        className="hub-textarea hub-textarea--sm"
                        rows={2}
                        value={step.description}
                        onChange={(e) => patchStep(selected, step.id, { description: e.target.value })}
                        aria-label={`Step ${idx + 1} description`}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="hub-panel hub-panel--muted">
                <p className="hub-placeholder">Select a playbook from the library, or create a new one.</p>
                <p className="hub-placeholder__sub">Runs you start from here show up under Runs with full step history.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
