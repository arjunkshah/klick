import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useKlickStore } from "../../data/store";
import type { IssueState, Priority } from "../../data/types";
import { AgentBadge } from "../components/AgentBadge";

export function IssueDetailPage() {
  const { issueId } = useParams();
  const issues = useKlickStore((s) => s.issues);
  const docs = useKlickStore((s) => s.docs);
  const tasks = useKlickStore((s) => s.tasks);
  const updateIssue = useKlickStore((s) => s.updateIssue);
  const addIssueComment = useKlickStore((s) => s.addIssueComment);
  const updateDoc = useKlickStore((s) => s.updateDoc);
  const addTask = useKlickStore((s) => s.addTask);
  const toggleTaskDone = useKlickStore((s) => s.toggleTaskDone);

  const issue = issues.find((i) => i.id === issueId);
  const [comment, setComment] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  const issueTasks = useMemo(
    () => tasks.filter((t) => t.issueId === issueId),
    [tasks, issueId],
  );

  if (!issue || !issueId) {
    return (
      <div className="p-g2">
        <p className="type-base text-theme-text-sec">Issue not found.</p>
        <Link to="/app/issues" className="btn-tertiary">
          Back to issues
        </Link>
      </div>
    );
  }

  const toggleDocLink = (docId: string) => {
    const has = issue.linkedDocIds.includes(docId);
    const linkedDocIds = has
      ? issue.linkedDocIds.filter((x) => x !== docId)
      : [...issue.linkedDocIds, docId];
    updateIssue(issue.id, { linkedDocIds });
    const doc = docs.find((d) => d.id === docId);
    if (doc) {
      const linkedIssueIds = has
        ? doc.linkedIssueIds.filter((x) => x !== issue.id)
        : [...doc.linkedIssueIds, issue.id];
      updateDoc(docId, { linkedIssueIds });
    }
  };

  const toggleBlocker = (otherId: string) => {
    const has = issue.blockedByIssueIds.includes(otherId);
    updateIssue(issue.id, {
      blockedByIssueIds: has
        ? issue.blockedByIssueIds.filter((x) => x !== otherId)
        : [...issue.blockedByIssueIds, otherId],
    });
  };

  const otherIssues = issues.filter((i) => i.id !== issue.id);

  return (
    <div className="mx-auto max-w-prose-medium-wide px-g2 py-v2">
      <Link to="/app/issues" className="type-sm text-theme-text-sec hover:text-theme-text">
        ← Issues
      </Link>
      <div className="mt-v1 flex flex-col gap-v2">
        <input
          className="type-md w-full border-0 border-b border-transparent bg-transparent p-0 font-medium text-theme-text outline-none focus-visible:border-theme-border-02"
          value={issue.title}
          onChange={(e) => updateIssue(issue.id, { title: e.target.value })}
        />
        <div className="flex flex-wrap gap-g1">
          <label className="type-sm flex items-center gap-2">
            State
            <select
              className="app-input !py-1"
              value={issue.state}
              onChange={(e) =>
                updateIssue(issue.id, { state: e.target.value as IssueState })
              }
            >
              {(
                [
                  "backlog",
                  "todo",
                  "in_progress",
                  "done",
                  "canceled",
                ] as const
              ).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="type-sm flex items-center gap-2">
            Priority
            <select
              className="app-input !py-1"
              value={issue.priority}
              onChange={(e) =>
                updateIssue(issue.id, { priority: e.target.value as Priority })
              }
            >
              {(["low", "medium", "high", "urgent"] as const).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="type-sm flex flex-col gap-1">
          Description
          <textarea
            className="app-input min-h-[120px]"
            value={issue.description}
            onChange={(e) => updateIssue(issue.id, { description: e.target.value })}
          />
        </label>

        <div className="card card--large !p-g1.5">
          <h2 className="type-base mb-v1">Blocked by</h2>
          <p className="type-sm mb-2 text-theme-text-sec">
            Dependencies and blockers (Linear-style).
          </p>
          <ul className="max-h-40 space-y-1 overflow-y-auto thin-scrollbar">
            {otherIssues.map((i) => (
              <li key={i.id} className="type-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={issue.blockedByIssueIds.includes(i.id)}
                  onChange={() => toggleBlocker(i.id)}
                  id={`bl-${i.id}`}
                />
                <label htmlFor={`bl-${i.id}`} className="cursor-pointer">
                  {i.title}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="card card--large !p-g1.5">
          <h2 className="type-base mb-v1">Tasks</h2>
          <ul className="mb-2 space-y-1">
            {issueTasks.map((t) => (
              <li key={t.id} className="type-sm flex items-center gap-2">
                <button
                  type="button"
                  className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${
                    t.done ? "border-theme-accent bg-theme-accent" : "border-theme-border-02-5"
                  }`}
                  onClick={() => toggleTaskDone(t.id)}
                  aria-label="Toggle task"
                />
                <span className={t.done ? "text-theme-text-sec line-through" : ""}>{t.title}</span>
              </li>
            ))}
          </ul>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!taskTitle.trim()) return;
              addTask({ title: taskTitle.trim(), issueId: issue.id, projectId: issue.projectId });
              setTaskTitle("");
            }}
          >
            <input
              className="app-input min-w-0 flex-1"
              placeholder="Add subtask…"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <button type="submit" className="btn btn--sm">
              Add
            </button>
          </form>
        </div>

        <div>
          <h2 className="type-base mb-v1">Linked docs</h2>
          <ul className="space-y-1">
            {docs.map((d) => (
              <li key={d.id} className="type-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={issue.linkedDocIds.includes(d.id)}
                  onChange={() => toggleDocLink(d.id)}
                  id={`doc-${d.id}`}
                />
                <label htmlFor={`doc-${d.id}`} className="cursor-pointer">
                  {d.title}
                </label>
                <Link to={`/app/docs/${d.id}`} className="btn-tertiary type-sm">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="type-base mb-v1">Activity</h2>
          <ul className="space-y-3">
            {issue.comments.map((c) => (
              <li
                key={c.id}
                className={`type-sm border-l-2 pl-3 ${
                  c.agent ? "agent-surface border-theme-accent-muted" : "border-theme-border-02"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-theme-text-sec">{c.author}</span>
                  {c.agent ? <AgentBadge compact /> : null}
                </div>
                <p className="mt-1 text-theme-text">{c.body}</p>
              </li>
            ))}
          </ul>
          <form
            className="mt-v2 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              addIssueComment(issue.id, comment.trim());
              setComment("");
            }}
          >
            <input
              className="app-input flex-1"
              placeholder="Add comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" className="btn btn--sm">
                Post
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  if (!comment.trim()) return;
                  addIssueComment(issue.id, comment.trim(), true);
                  setComment("");
                }}
              >
                Post as agent draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
