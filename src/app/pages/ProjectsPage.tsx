import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../data/types";
import { useKlickStore } from "../../data/store";

function formatDue(dueDate: string | null): string {
  if (!dueDate) return "No date";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(dueDate),
    );
  } catch {
    return dueDate;
  }
}

function statusLabel(status: Project["status"]): string {
  const m = { active: "Active", paused: "Paused", archived: "Archived" };
  return m[status];
}

export function ProjectsPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const projects = useKlickStore((s) => s.projects);
  const issues = useKlickStore((s) => s.issues);
  const addProject = useKlickStore((s) => s.addProject);
  const updateProject = useKlickStore((s) => s.updateProject);
  const toggleMilestone = useKlickStore((s) => s.toggleMilestone);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "">("");

  const issueCountByProject = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of issues) {
      m.set(i.projectId, (m.get(i.projectId) ?? 0) + 1);
    }
    return m;
  }, [issues]);

  const filtered = useMemo(() => {
    if (!statusFilter) return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const order = { active: 0, paused: 1, archived: 2 };
      const so = order[a.status] - order[b.status];
      if (so !== 0) return so;
      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  return (
    <div className="app-page">
      <div className="today-page work-page">
        <header className="today-page__header">
          <p className="today-page__workspace">{workspace.name}</p>
          <div className="today-page__title-row">
            <h1 className="today-page__title">Projects</h1>
            <Link to="/app/tasks" className="today-link">
              Tasks
            </Link>
          </div>
        </header>

        <div className="projects-surface">
          <div className="projects-toolbar">
            <input
              type="text"
              className="projects-toolbar__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New project name…"
              aria-label="Project name"
            />
            <input
              type="text"
              className="projects-toolbar__input projects-toolbar__input--wide"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              aria-label="Description"
            />
            <button
              type="button"
              className="work-btn work-btn--primary"
              disabled={!name.trim()}
              onClick={() => {
                addProject(name.trim(), description.trim());
                setName("");
                setDescription("");
              }}
            >
              Create
            </button>
            <div className="projects-toolbar__spacer" aria-hidden />
            <select
              className="projects-toolbar__select"
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target.value || "") as Project["status"] | "")}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
            <span className="projects-toolbar__meta">{sorted.length} projects</span>
          </div>

          <ul className="projects-list">
            {sorted.map((p) => {
              const issueN = issueCountByProject.get(p.id) ?? 0;
              const doneM = p.milestones.filter((m) => m.done).length;
              const totalM = p.milestones.length;
              return (
                <li key={p.id} className="projects-block">
                  <div className="projects-block__head">
                    <div className="projects-block__titles">
                      <h2 className="projects-block__name">{p.name}</h2>
                      <p className="projects-block__desc">{p.description || "No description yet."}</p>
                    </div>
                    <div className="projects-block__badges">
                      <span className={`projects-block__status projects-block__status--${p.status}`}>
                        {statusLabel(p.status)}
                      </span>
                      <span className="projects-block__issues">
                        {issueN} issue{issueN === 1 ? "" : "s"}
                      </span>
                      <Link to="/app/issues" className="today-link projects-block__link">
                        Issues
                      </Link>
                    </div>
                  </div>
                  <label className="projects-block__status-field">
                    <span className="projects-block__label">Status</span>
                    <select
                      className="projects-block__select"
                      value={p.status}
                      onChange={(e) =>
                        updateProject(p.id, { status: e.target.value as Project["status"] })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                  {totalM > 0 ? (
                    <div className="projects-block__milestones">
                      <div className="projects-block__milestones-head">
                        <span className="projects-block__label">Milestones</span>
                        <span className="projects-block__milestones-meta">
                          {doneM}/{totalM} done
                        </span>
                      </div>
                      <ul className="projects-block__milestone-list">
                        {p.milestones.map((m) => (
                          <li key={m.id} className="projects-block__milestone">
                            <label className="projects-block__milestone-label">
                              <input
                                type="checkbox"
                                checked={m.done}
                                onChange={() => toggleMilestone(p.id, m.id)}
                              />
                              <span className={m.done ? "projects-block__milestone-name--done" : undefined}>
                                {m.name}
                              </span>
                            </label>
                            <span className="projects-block__milestone-due">{formatDue(m.dueDate)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="projects-block__empty-milestones">No milestones yet.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
