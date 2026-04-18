import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Issue, IssueState, Priority, Project, TeamMember } from "../../data/types";
import { useKlickStore } from "../../data/store";
import { formatIssueState, issueRef, priorityOrder } from "../work/format";

const BOARD_STATES: IssueState[] = ["backlog", "todo", "in_progress", "done", "canceled"];

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

function sortIssuesInColumn(list: Issue[]): Issue[] {
  return [...list].sort((a, b) => {
    const pr = priorityOrder(a.priority) - priorityOrder(b.priority);
    if (pr !== 0) return pr;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function IssueExpandedPane({
  issue,
  membersById,
  projectsById,
  issueById,
  onCollapse,
}: {
  issue: Issue;
  membersById: Map<string, TeamMember>;
  projectsById: Map<string, Project>;
  issueById: Map<string, Issue>;
  onCollapse: () => void;
}) {
  const updateIssue = useKlickStore((s) => s.updateIssue);
  const addIssueComment = useKlickStore((s) => s.addIssueComment);
  const [comment, setComment] = useState("");

  const blockers = issue.blockedByIssueIds
    .map((id) => issueById.get(id))
    .filter((x): x is Issue => Boolean(x));

  return (
    <div className="issues-expand thin-scrollbar" aria-label="Issue details">
      <div className="issues-expand__header">
        <div className="issues-expand__header-main">
          <span className="issues-expand__ref">{issueRef(issue.id)}</span>
          <span className="issues-expand__hint">Full detail — add description, comments, and metadata.</span>
        </div>
        <button type="button" className="issues-expand__collapse" onClick={onCollapse}>
          Collapse
        </button>
      </div>

      <input
        type="text"
        className="issues-expand__title-input"
        value={issue.title}
        onChange={(e) => updateIssue(issue.id, { title: e.target.value })}
        aria-label="Title"
      />

      <div className="issues-expand__meta">
        <label className="issues-expand__field">
          <span className="issues-expand__label">State</span>
          <select
            className="issues-expand__select"
            value={issue.state}
            onChange={(e) => updateIssue(issue.id, { state: e.target.value as IssueState })}
          >
            {BOARD_STATES.map((s) => (
              <option key={s} value={s}>
                {formatIssueState(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="issues-expand__field">
          <span className="issues-expand__label">Priority</span>
          <select
            className="issues-expand__select"
            value={issue.priority}
            onChange={(e) => updateIssue(issue.id, { priority: e.target.value as Priority })}
          >
            {(["urgent", "high", "medium", "low"] as const).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="issues-expand__field">
          <span className="issues-expand__label">Project</span>
          <select
            className="issues-expand__select"
            value={issue.projectId}
            onChange={(e) => updateIssue(issue.id, { projectId: e.target.value })}
          >
            {[...projectsById.entries()].map(([id, pr]) => (
              <option key={id} value={id}>
                {pr.name}
              </option>
            ))}
          </select>
        </label>
        <label className="issues-expand__field">
          <span className="issues-expand__label">Assignee</span>
          <select
            className="issues-expand__select"
            value={issue.assigneeId ?? ""}
            onChange={(e) =>
              updateIssue(issue.id, { assigneeId: e.target.value === "" ? null : e.target.value })
            }
          >
            <option value="">Unassigned</option>
            {[...membersById.entries()].map(([id, m]) => (
              <option key={id} value={id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="issues-expand__field">
          <span className="issues-expand__label">Cycle</span>
          <input
            type="text"
            className="issues-expand__input"
            value={issue.cycle ?? ""}
            onChange={(e) => updateIssue(issue.id, { cycle: e.target.value.trim() || null })}
            placeholder="e.g. 2026-W16"
          />
        </label>
      </div>

      <div className="issues-expand__block">
        <span className="issues-expand__label">Description</span>
        <textarea
          className="issues-expand__textarea thin-scrollbar"
          value={issue.description}
          onChange={(e) => updateIssue(issue.id, { description: e.target.value })}
          placeholder="Add context, acceptance criteria, links…"
          rows={5}
        />
      </div>

      {blockers.length > 0 ? (
        <div className="issues-expand__block">
          <span className="issues-expand__label">Blocked by</span>
          <ul className="issues-expand__list">
            {blockers.map((b) => (
              <li key={b.id}>
                <span className="issues-expand__ref-inline">{issueRef(b.id)}</span> {b.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {issue.labels.length > 0 ? (
        <div className="issues-expand__block issues-expand__block--row">
          {issue.labels.map((lb) => (
            <span key={lb} className="issues-expand__pill">
              {lb}
            </span>
          ))}
        </div>
      ) : null}

      <div className="issues-expand__block">
        <span className="issues-expand__label">Comments</span>
        <ul className="issues-expand__comments">
          {issue.comments.map((c) => (
            <li key={c.id} className="issues-expand__comment">
              <div className="issues-expand__comment-meta">
                <strong>{c.author}</strong>
                {c.agent ? <span className="issues-expand__agent">Agent</span> : null}
              </div>
              <p className="issues-expand__comment-body">{c.body}</p>
            </li>
          ))}
        </ul>
        <div className="issues-expand__composer">
          <textarea
            className="issues-expand__textarea thin-scrollbar"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
          />
          <button
            type="button"
            className="work-btn work-btn--primary"
            disabled={!comment.trim()}
            onClick={() => {
              addIssueComment(issue.id, comment.trim());
              setComment("");
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export function IssuesPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const issues = useKlickStore((s) => s.issues);
  const projects = useKlickStore((s) => s.projects);
  const members = useKlickStore((s) => s.members);
  const updateIssue = useKlickStore((s) => s.updateIssue);
  const addIssue = useKlickStore((s) => s.addIssue);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState("");

  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const issueById = useMemo(() => new Map(issues.map((i) => [i.id, i])), [issues]);

  const defaultProjectId = projects[0]?.id ?? "";
  const createProjectId = newProjectId || defaultProjectId;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues.filter((i) => {
      if (projectFilter && i.projectId !== projectFilter) return false;
      if (assigneeFilter && i.assigneeId !== assigneeFilter) return false;
      if (priorityFilter && i.priority !== priorityFilter) return false;
      if (q && !i.title.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [issues, search, projectFilter, assigneeFilter, priorityFilter]);

  const byState = useMemo(() => {
    const m = new Map<IssueState, Issue[]>();
    for (const s of BOARD_STATES) m.set(s, []);
    for (const i of filtered) {
      const list = m.get(i.state);
      if (list) list.push(i);
    }
    for (const s of BOARD_STATES) m.set(s, sortIssuesInColumn(m.get(s)!));
    return m;
  }, [filtered]);

  const expanded = expandedId ? issueById.get(expandedId) : undefined;

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((cur) => (cur === id ? null : id));
  }, []);

  return (
    <div className="app-page">
      <div className="today-page work-page work-page--wide">
        <header className="today-page__header">
          <p className="today-page__workspace">{workspace.name}</p>
          <div className="today-page__title-row">
            <h1 className="today-page__title">Issues</h1>
            <Link to="/app" className="today-link">
              Today
            </Link>
          </div>
        </header>

        <div className="issues-surface">
          <div className="issues-toolbar">
            <input
              type="search"
              className="issues-toolbar__search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              aria-label="Search issues"
            />
            <select
              className="issues-toolbar__select"
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
            <select
              className="issues-toolbar__select"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              aria-label="Assignee"
            >
              <option value="">All assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              className="issues-toolbar__select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter((e.target.value || "") as Priority | "")}
              aria-label="Priority"
            >
              <option value="">All priorities</option>
              {(["urgent", "high", "medium", "low"] as const).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className="issues-toolbar__meta">{filtered.length} issues</span>
            <div className="issues-toolbar__spacer" aria-hidden />
            <input
              type="text"
              className="issues-toolbar__new-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New issue title…"
              aria-label="New issue title"
            />
            <select
              className="issues-toolbar__select issues-toolbar__select--narrow"
              value={createProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              aria-label="Project for new issue"
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
              disabled={!newTitle.trim() || !createProjectId}
              onClick={() => {
                const id = addIssue({ title: newTitle.trim(), projectId: createProjectId });
                setNewTitle("");
                setExpandedId(id);
              }}
            >
              Create
            </button>
          </div>

          <div className="issues-board-wrap thin-scrollbar">
            <div className="issues-board">
              {BOARD_STATES.map((state) => {
                const col = byState.get(state) ?? [];
                return (
                  <div key={state} className="issues-col">
                    <div className="issues-col__head">
                      <span className="issues-col__title">{formatIssueState(state)}</span>
                      <span className="issues-col__count">{col.length}</span>
                    </div>
                    <div className="issues-col__list" role="list">
                      {col.map((issue) => {
                        const isOpen = expandedId === issue.id;
                        return (
                          <div key={issue.id} role="listitem" className="issues-row-wrap">
                            <div
                              role="button"
                              tabIndex={0}
                              className={`issues-row${isOpen ? " issues-row--open" : ""}`}
                              onClick={() => toggleExpand(issue.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  toggleExpand(issue.id);
                                }
                              }}
                            >
                              <span className="issues-row__chevron" aria-hidden>
                                {isOpen ? (
                                  <ChevronDown size={14} strokeWidth={1.75} />
                                ) : (
                                  <ChevronRight size={14} strokeWidth={1.75} />
                                )}
                              </span>
                              <span className="issues-row__ref">{issueRef(issue.id)}</span>
                              <span
                                className={`today-priority today-priority--${issue.priority} issues-row__pri`}
                                title={issue.priority}
                              >
                                <span className="today-priority__dot" aria-hidden />
                              </span>
                              <span className="issues-row__title">{issue.title}</span>
                              <span className="issues-row__project">
                                {projectsById.get(issue.projectId)?.name ?? "—"}
                              </span>
                              <span className="issues-row__avatar">
                                <Avatar
                                  member={
                                    issue.assigneeId ? membersById.get(issue.assigneeId) ?? null : null
                                  }
                                />
                              </span>
                              <select
                                className="issues-row__move"
                                value={issue.state}
                                aria-label={`Move ${issueRef(issue.id)}`}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const next = e.target.value as IssueState;
                                  updateIssue(issue.id, { state: next });
                                }}
                              >
                                {BOARD_STATES.map((s) => (
                                  <option key={s} value={s}>
                                    {formatIssueState(s)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                      {col.length === 0 ? (
                        <p className="issues-col__empty">Empty</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {expanded ? (
            <IssueExpandedPane
              issue={expanded}
              membersById={membersById}
              projectsById={projectsById}
              issueById={issueById}
              onCollapse={() => setExpandedId(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
