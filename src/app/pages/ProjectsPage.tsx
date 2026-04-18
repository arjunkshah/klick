import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function ProjectsPage() {
  const projects = useKlickStore((s) => s.projects);
  const issues = useKlickStore((s) => s.issues);
  const addProject = useKlickStore((s) => s.addProject);
  const toggleMilestone = useKlickStore((s) => s.toggleMilestone);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const counts = useMemo(() => {
    const m = new Map<string, { open: number; done: number }>();
    for (const p of projects) m.set(p.id, { open: 0, done: 0 });
    for (const i of issues) {
      const c = m.get(i.projectId);
      if (!c) continue;
      if (i.state === "done" || i.state === "canceled") c.done += 1;
      else c.open += 1;
    }
    return m;
  }, [projects, issues]);

  return (
    <div className="mx-auto max-w-prose-medium-wide px-g2 py-v2">
      <div className="mb-v2 border-b border-theme-border-01 pb-v2">
        <h1 className="type-md mb-v1">Projects</h1>
        <p className="type-sm text-theme-text-sec">
          Roadmap containers with milestones—issues and threads can anchor here.
        </p>
      </div>

      <form
        className="card card--large !mb-v2 !p-g1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          addProject(name.trim(), desc.trim());
          setName("");
          setDesc("");
        }}
      >
        <div className="type-product-sm mb-2 text-theme-text-tertiary">New project</div>
        <input
          className="app-input mb-2 w-full"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="app-input mb-2 w-full"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button type="submit" className="btn btn--sm">
          Add project
        </button>
      </form>

      <ul className="space-y-g1">
        {projects.map((p) => {
          const c = counts.get(p.id) ?? { open: 0, done: 0 };
          return (
            <li key={p.id} className="card card--large !p-g1.5">
              <div className="flex flex-wrap items-start justify-between gap-g1">
                <div>
                  <div className="type-base font-medium">{p.name}</div>
                  <p className="type-sm mt-1 text-theme-text-sec">{p.description}</p>
                  <div className="type-product-sm mt-2 text-theme-text-mid capitalize">
                    {p.status} · {c.open} open · {c.done} closed
                  </div>
                </div>
                <Link
                  to={`/app/issues?view=board`}
                  className="btn btn--secondary btn--sm no-underline"
                >
                  Board
                </Link>
              </div>
              {p.milestones.length > 0 ? (
                <div className="mt-v2 border-t border-theme-border-01 pt-v2">
                  <div className="type-product-sm mb-2 text-theme-text-tertiary">Milestones</div>
                  <ul className="space-y-1">
                    {p.milestones.map((m) => (
                      <li key={m.id} className="type-sm flex items-center gap-2">
                        <button
                          type="button"
                          className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${
                            m.done ? "border-theme-accent bg-theme-accent" : "border-theme-border-02-5"
                          }`}
                          onClick={() => toggleMilestone(p.id, m.id)}
                          aria-label="Toggle milestone"
                        />
                        <span className={m.done ? "text-theme-text-sec line-through" : ""}>
                          {m.name}
                        </span>
                        {m.dueDate ? (
                          <span className="type-product-sm text-theme-text-tertiary">
                            {m.dueDate}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
