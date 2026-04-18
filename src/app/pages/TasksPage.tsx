import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { TeamMember } from "../../data/types";
import { useKlickStore } from "../../data/store";
import { issueRef } from "../work/format";

function Avatar({ member }: { member: TeamMember | null }) {
  if (!member) {
    return <span className="work-avatar work-avatar--empty" title="Unassigned" />;
  }
  const initials = member.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="work-avatar" title={member.name}>
      {initials}
    </span>
  );
}

function formatDue(dueAt: string | null): string {
  if (!dueAt) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(dueAt));
  } catch {
    return dueAt;
  }
}

export function TasksPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const tasks = useKlickStore((s) => s.tasks);
  const projects = useKlickStore((s) => s.projects);
  const members = useKlickStore((s) => s.members);
  const issues = useKlickStore((s) => s.issues);
  const toggleTaskDone = useKlickStore((s) => s.toggleTaskDone);
  const addTask = useKlickStore((s) => s.addTask);

  const [showDone, setShowDone] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState<string>("");

  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const issuesById = useMemo(() => new Map(issues.map((i) => [i.id, i])), [issues]);

  const defaultProjectId = projects[0]?.id ?? "";
  const addProjectId = newProjectId || defaultProjectId;

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (!showDone && t.done) return false;
      if (projectFilter && t.projectId !== projectFilter) return false;
      return true;
    });
  }, [tasks, showDone, projectFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const da = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
      const db = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
      if (da !== db) return da - db;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filtered]);

  const openCount = tasks.filter((t) => !t.done).length;

  return (
    <div className="app-page">
      <div className="today-page work-page">
        <header className="today-page__header">
          <p className="today-page__workspace">{workspace.name}</p>
          <div className="today-page__title-row">
            <h1 className="today-page__title">Tasks</h1>
            <div className="tasks-page__title-meta">
              <span className="today-page__date">
                {openCount} open · {tasks.length} total
              </span>
              <Link to="/app/issues" className="today-link">
                Issues
              </Link>
            </div>
          </div>
        </header>

        <div className="tasks-surface">
          <div className="tasks-toolbar">
            <label className="tasks-toolbar__check">
              <input
                type="checkbox"
                checked={showDone}
                onChange={(e) => setShowDone(e.target.checked)}
              />
              Show completed
            </label>
            <select
              className="tasks-toolbar__select"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              aria-label="Project"
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="tasks-toolbar__meta">{sorted.length} shown</span>
            <div className="tasks-toolbar__spacer" aria-hidden />
            <input
              type="text"
              className="tasks-toolbar__new"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New task…"
              aria-label="New task title"
            />
            <select
              className="tasks-toolbar__select"
              value={addProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              aria-label="Project"
              disabled={projects.length === 0}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="work-btn work-btn--primary"
              disabled={!newTitle.trim() || !addProjectId}
              onClick={() => {
                addTask({ title: newTitle.trim(), projectId: addProjectId });
                setNewTitle("");
              }}
            >
              Add
            </button>
          </div>

          {sorted.length === 0 ? (
            <p className="tasks-empty">No tasks match these filters.</p>
          ) : (
            <div className="tasks-table-wrap thin-scrollbar">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th className="tasks-table__th tasks-table__th--check" aria-hidden />
                    <th className="tasks-table__th">Task</th>
                    <th className="tasks-table__th">Project</th>
                    <th className="tasks-table__th">Issue</th>
                    <th className="tasks-table__th">Assignee</th>
                    <th className="tasks-table__th tasks-table__th--due">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((t) => {
                    const issue = t.issueId ? issuesById.get(t.issueId) : null;
                    return (
                      <tr key={t.id} className={t.done ? "tasks-table__tr--done" : undefined}>
                        <td className="tasks-table__td tasks-table__td--check">
                          <input
                            type="checkbox"
                            checked={t.done}
                            onChange={() => toggleTaskDone(t.id)}
                            aria-label={t.done ? `Mark "${t.title}" not done` : `Mark "${t.title}" done`}
                          />
                        </td>
                        <td className="tasks-table__td">
                          <span className="tasks-table__title">{t.title}</span>
                        </td>
                        <td className="tasks-table__td tasks-table__td--muted">
                          {t.projectId ? projectsById.get(t.projectId)?.name ?? "—" : "—"}
                        </td>
                        <td className="tasks-table__td tasks-table__td--muted">
                          {issue ? (
                            <Link to="/app/issues" className="today-link">
                              {issueRef(issue.id)}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="tasks-table__td tasks-table__td--assignee">
                          <Avatar member={t.assigneeId ? membersById.get(t.assigneeId) ?? null : null} />
                        </td>
                        <td className="tasks-table__td tasks-table__td--due">{formatDue(t.dueAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
