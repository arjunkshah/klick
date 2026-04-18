import type { WorkspacePayload } from "../lib/firestoreWorkspace";

/** Compact JSON string for Gemini system context (token-aware). */
export function buildWorkspaceContextJson(state: WorkspacePayload): string {
  const activeIssues = state.issues.filter((i) => i.state !== "done" && i.state !== "canceled");
  const youId =
    state.members.find((m) => m.email === state.profile.email)?.id ?? state.members[0]?.id;
  return JSON.stringify(
    {
      workspace: state.workspace,
      user: { email: state.profile.email, displayName: state.profile.displayName, memberId: youId },
      counts: {
        projects: state.projects.length,
        activeIssues: activeIssues.length,
        docs: state.docs.length,
        inboxUnread: state.inbox.filter((n) => !n.read).length,
        tasksOpen: state.tasks.filter((t) => !t.done).length,
        runsRunning: state.runs.filter((r) => r.status === "running").length,
      },
      projects: state.projects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        milestones: p.milestones.length,
      })),
      issues: activeIssues.slice(0, 80).map((i) => ({
        id: i.id,
        title: i.title,
        state: i.state,
        priority: i.priority,
        projectId: i.projectId,
        assigneeId: i.assigneeId,
        cycle: i.cycle,
        labels: i.labels,
        blockedBy: i.blockedByIssueIds,
      })),
      inbox: state.inbox.slice(0, 40).map((n) => ({
        type: n.type,
        title: n.title,
        body: n.body,
        read: n.read,
      })),
      tasks: state.tasks.slice(0, 60).map((t) => ({
        title: t.title,
        done: t.done,
        projectId: t.projectId,
        dueAt: t.dueAt,
      })),
      members: state.members.map((m) => ({ id: m.id, name: m.name, email: m.email, role: m.role })),
      channels: state.channels.map((c) => ({ id: c.id, name: c.name, type: c.type })),
      recentMessages: state.messages.slice(-24).map((m) => ({
        channelId: m.channelId,
        body: m.body,
        agent: Boolean(m.agent),
      })),
      playbooks: state.playbooks.map((p) => ({ id: p.id, name: p.name, steps: p.steps.length })),
      runs: state.runs.slice(0, 15).map((r) => ({
        name: r.playbookName,
        status: r.status,
        stepIndex: r.currentStepIndex,
      })),
    },
    null,
    0,
  );
}
