import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function TasksPage() {
  const tasks = useKlickStore((s) => s.tasks);
  const issues = useKlickStore((s) => s.issues);
  const projects = useKlickStore((s) => s.projects);
  const members = useKlickStore((s) => s.members);
  const addTask = useKlickStore((s) => s.addTask);
  const toggleTaskDone = useKlickStore((s) => s.toggleTaskDone);

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [issueId, setIssueId] = useState<string | "">("");

  const issueTitle = useMemo(() => new Map(issues.map((i) => [i.id, i.title])), [issues]);
  const projectName = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);
  const memberName = useMemo(() => new Map(members.map((m) => [m.id, m.name])), [members]);

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="mx-auto max-w-[900px] px-g2 py-v2">
      <div className="mb-v2 border-b border-theme-border-01 pb-v2">
        <h1 className="type-md mb-v1">Tasks</h1>
        <p className="type-sm text-theme-text-sec">
          Checklists on issues and standalone work—stays synced with Linear-style execution.
        </p>
      </div>

      <form
        className="card card--large !mb-v2 !p-g1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addTask({
            title: title.trim(),
            projectId: projectId || null,
            issueId: issueId || null,
          });
          setTitle("");
        }}
      >
        <div className="type-product-sm mb-2 text-theme-text-tertiary">New task</div>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            className="app-input min-w-0 flex-1"
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="app-input md:w-44"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="app-input md:w-48"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
          >
            <option value="">No issue</option>
            {issues.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn--sm">
            Add
          </button>
        </div>
      </form>

      <h2 className="type-base mb-v1">Open</h2>
      <ul className="mb-v3 divide-y divide-theme-border-01 rounded-xs border border-theme-border-01 bg-theme-card-hex">
        {open.map((t) => (
          <li key={t.id} className="thread-row flex flex-wrap items-center gap-g1 px-g1.5 py-3">
            <button
              type="button"
              className="h-4 w-4 shrink-0 rounded-sm border border-theme-border-02-5"
              aria-label="Mark done"
              onClick={() => toggleTaskDone(t.id)}
            />
            <span className="type-sm flex-1 font-medium text-theme-text">{t.title}</span>
            {t.issueId ? (
              <Link className="type-product-sm text-theme-accent no-underline" to={`/app/issues/${t.issueId}`}>
                {issueTitle.get(t.issueId)}
              </Link>
            ) : null}
            {t.projectId ? (
              <span className="type-product-sm text-theme-text-tertiary">
                {projectName.get(t.projectId)}
              </span>
            ) : null}
            {t.assigneeId ? (
              <span className="type-product-sm text-theme-text-mid">{memberName.get(t.assigneeId)}</span>
            ) : null}
          </li>
        ))}
        {open.length === 0 ? (
          <li className="px-g1.5 py-6 text-center type-sm text-theme-text-sec">No open tasks.</li>
        ) : null}
      </ul>

      <h2 className="type-base mb-v1">Done</h2>
      <ul className="divide-y divide-theme-border-01 rounded-xs border border-theme-border-01 opacity-75">
        {done.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-g1 px-g1.5 py-2">
            <button
              type="button"
              className="h-4 w-4 shrink-0 rounded-sm border border-theme-accent bg-theme-accent"
              aria-label="Mark not done"
              onClick={() => toggleTaskDone(t.id)}
            />
            <span className="type-sm line-through text-theme-text-sec">{t.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
