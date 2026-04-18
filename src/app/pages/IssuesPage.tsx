import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useKlickStore } from "../../data/store";
import type { IssueState } from "../../data/types";

const BOARD_ORDER: IssueState[] = ["backlog", "todo", "in_progress", "done", "canceled"];

const colLabel: Record<IssueState, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
  canceled: "Canceled",
};

export function IssuesPage() {
  const [params, setParams] = useSearchParams();
  const showNew = params.get("new") === "1";
  const view = params.get("view") === "board" ? "board" : "list";
  const filter = params.get("filter") === "mine" ? "mine" : "all";

  const issues = useKlickStore((s) => s.issues);
  const projects = useKlickStore((s) => s.projects);
  const members = useKlickStore((s) => s.members);
  const addIssue = useKlickStore((s) => s.addIssue);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");

  const u1 = members.find((m) => m.id === "u1")?.id ?? "u1";

  const filtered = useMemo(() => {
    if (filter !== "mine") return issues;
    return issues.filter((i) => i.assigneeId === u1);
  }, [issues, filter, u1]);

  const projectName = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  const setView = (v: "list" | "board") => {
    const n = new URLSearchParams(params);
    n.set("view", v);
    setParams(n);
  };

  const setFilter = (f: "all" | "mine") => {
    const n = new URLSearchParams(params);
    if (f === "all") n.delete("filter");
    else n.set("filter", f);
    setParams(n);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-theme-border-01 bg-theme-bg px-g2 py-v2">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-g1">
          <div>
            <h1 className="type-md mb-v1">Issues</h1>
            <p className="type-sm text-theme-text-sec">
              Linear-style cycles, owners, and board—linked to docs and threads.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <div className="mr-2 flex rounded-xs border border-theme-border-01 p-0.5">
              <button
                type="button"
                className={view === "list" ? "btn btn--sm" : "btn--quinary type-sm px-3 py-1"}
                onClick={() => setView("list")}
              >
                List
              </button>
              <button
                type="button"
                className={view === "board" ? "btn btn--sm" : "btn--quinary type-sm px-3 py-1"}
                onClick={() => setView("board")}
              >
                Board
              </button>
            </div>
            <button
              type="button"
              className={filter === "mine" ? "btn btn--secondary btn--sm" : "btn--quinary type-sm"}
              onClick={() => setFilter(filter === "mine" ? "all" : "mine")}
            >
              Mine
            </button>
            <Link
              to={showNew ? "/app/issues" : "/app/issues?new=1"}
              className="btn btn--sm no-underline"
            >
              {showNew ? "Cancel" : "New issue"}
            </Link>
          </div>
        </div>
      </div>

      <div className="thin-scrollbar flex-1 overflow-auto px-g2 py-v2">
        <div className="mx-auto max-w-[1200px]">
          {showNew ? (
            <form
              className="card card--large !mb-v2 !p-g1.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim() || !projectId) return;
                addIssue({ title: title.trim(), projectId });
                setTitle("");
                setParams({});
              }}
            >
              <div className="type-product-sm mb-2 text-theme-text-tertiary">Create issue</div>
              <div className="flex flex-col gap-v2 md:flex-row">
                <label className="type-sm flex flex-1 flex-col gap-1">
                  Title
                  <input
                    className="app-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to happen?"
                    required
                  />
                </label>
                <label className="type-sm flex flex-col gap-1 md:w-48">
                  Project
                  <select
                    className="app-input"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="submit" className="btn btn--sm mt-v2">
                Create
              </button>
            </form>
          ) : null}

          {view === "list" ? (
            <div className="overflow-x-auto rounded-xs border border-theme-border-01">
              <table className="w-full border-collapse text-left type-sm">
                <thead>
                  <tr className="border-b border-theme-border-01 bg-theme-card-hex">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">State</th>
                    <th className="p-3 font-medium">Priority</th>
                    <th className="p-3 font-medium">Cycle</th>
                    <th className="p-3 font-medium">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr
                      key={i.id}
                      className="thread-row border-b border-theme-border-01"
                    >
                      <td className="p-3">
                        <Link
                          to={`/app/issues/${i.id}`}
                          className="font-medium text-theme-text no-underline hover:text-theme-accent"
                        >
                          {i.title}
                        </Link>
                        {i.labels.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {i.labels.map((lb) => (
                              <span
                                key={lb}
                                className="type-product-sm rounded-xs border border-theme-border-01 px-1.5 py-px text-theme-text-tertiary"
                              >
                                {lb}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3 capitalize text-theme-text-sec">
                        {i.state.replace("_", " ")}
                      </td>
                      <td className="p-3 text-theme-text-sec">{i.priority}</td>
                      <td className="type-product-sm p-3 text-theme-text-mid">
                        {i.cycle ?? "—"}
                      </td>
                      <td className="p-3 text-theme-text-sec">
                        {projectName.get(i.projectId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex gap-g1 overflow-x-auto pb-2">
              {BOARD_ORDER.map((state) => (
                <div key={state} className="board-col">
                  <div className="type-product-sm mb-2 px-1 text-theme-text-tertiary">
                    {colLabel[state]} · {filtered.filter((i) => i.state === state).length}
                  </div>
                  <div className="space-y-g1">
                    {filtered
                      .filter((i) => i.state === state)
                      .map((i) => (
                        <Link
                          key={i.id}
                          to={`/app/issues/${i.id}`}
                          className="card card--large block !p-g1.5 no-underline"
                        >
                          <div className="type-sm font-medium text-theme-text">{i.title}</div>
                          <div className="type-product-sm mt-2 text-theme-text-tertiary">
                            {projectName.get(i.projectId)} · {i.priority}
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
