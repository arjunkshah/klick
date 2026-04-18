import { create } from "zustand";
import { buildDexReply, snapshotDexContext } from "../dex/buildDexReply";
import { buildWorkspaceContextJson } from "../dex/workspaceContext";
import { fetchDexReply } from "../lib/dexClient";
import type { WorkspacePayload } from "../lib/firestoreWorkspace";
import type {
  Channel,
  ChannelMessage,
  DexMessage,
  Doc,
  DocFolder,
  InboxItem,
  Issue,
  IssueState,
  Playbook,
  PlaybookRun,
  Priority,
  Project,
  RunStepLog,
  Task,
  TeamMember,
} from "./types";

const now = () => new Date().toISOString();

function id() {
  return crypto.randomUUID();
}

export type WorkspaceLoadState = "idle" | "loading" | "ready" | "error";

function initialDexMessages(): DexMessage[] {
  return [
    {
      id: "dex-welcome",
      role: "assistant",
      content:
        "I’m **Dex**. Ask anything about your workspace—summaries, blockers, inbox, tasks—using the live data synced from Firebase.",
      createdAt: now(),
    },
  ];
}

function currentMemberId(get: () => KlickStore): string | null {
  const s = get();
  return (
    s.members.find((m) => m.email === s.profile.email)?.id ?? s.members[0]?.id ?? null
  );
}

function mockAgentOutput(title: string): string {
  return `[Agent draft]\n\n## ${title}\n\n- Highlight: team velocity up week over week.\n- Risk: two P1 issues still in backlog.\n- Next: align on scope for Slack mirror v2.\n\n_Edit after approval or reject to retry._`;
}

function initialLogsForPlaybook(pb: Playbook): RunStepLog[] {
  return pb.steps.map((s) => ({
    stepId: s.id,
    title: s.title,
    type: s.type,
    status: "pending" as const,
  }));
}

function activateStep(logs: RunStepLog[], stepIndex: number, pb: Playbook): RunStepLog[] {
  const next = [...logs];
  const step = pb.steps[stepIndex];
  if (!step) return next;
  if (step.type === "agent") {
    next[stepIndex] = {
      ...next[stepIndex],
      status: "awaiting_approval",
      output: mockAgentOutput(step.title),
    };
  } else {
    next[stepIndex] = { ...next[stepIndex], status: "pending" };
  }
  return next;
}

function toWorkspacePayload(s: KlickStore): WorkspacePayload {
  return {
    workspace: s.workspace,
    profile: s.profile,
    members: s.members,
    projects: s.projects,
    issues: s.issues,
    docFolders: s.docFolders,
    docs: s.docs,
    inbox: s.inbox,
    playbooks: s.playbooks,
    runs: s.runs,
    channels: s.channels,
    messages: s.messages,
    tasks: s.tasks,
    dexMessages: s.dexMessages,
  };
}

type KlickStore = {
  workspaceLoadState: WorkspaceLoadState;
  workspaceLoadError: string | null;
  remoteSaveSuspended: boolean;

  workspace: { name: string; slackConnected: boolean };
  profile: { displayName: string; email: string };
  members: TeamMember[];
  projects: Project[];
  issues: Issue[];
  docFolders: DocFolder[];
  docs: Doc[];
  inbox: InboxItem[];
  playbooks: Playbook[];
  runs: PlaybookRun[];
  channels: Channel[];
  messages: ChannelMessage[];
  tasks: Task[];

  dexMessages: DexMessage[];
  dexBusy: boolean;
  dexLastError: string | null;

  setWorkspaceLoadState: (state: WorkspaceLoadState, error?: string | null) => void;
  hydrateFromFirestore: (payload: WorkspacePayload) => void;
  setRemoteSaveSuspended: (v: boolean) => void;
  getWorkspacePayload: () => WorkspacePayload;

  setWorkspaceName: (name: string) => void;
  setSlackConnected: (v: boolean) => void;
  setProfile: (p: { displayName: string; email: string }) => void;

  addProject: (name: string, description: string) => void;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;

  addIssue: (partial: {
    title: string;
    projectId: string;
    state?: IssueState;
    priority?: Priority;
  }) => string;
  updateIssue: (issueId: string, patch: Partial<Issue>) => void;
  addIssueComment: (issueId: string, body: string, agent?: boolean) => void;

  addDocFolder: (name: string, parentFolderId: string | null, icon?: string) => string;
  addDoc: (title: string, parentId: string | null, folderId?: string | null) => string;
  updateDoc: (docId: string, patch: Partial<Doc>) => void;

  addChannel: (name: string, type: Channel["type"], topic?: string) => string;
  postMessage: (channelId: string, body: string, parentId?: string | null) => void;

  addTask: (partial: {
    title: string;
    issueId?: string | null;
    projectId?: string | null;
    assigneeId?: string | null;
    dueAt?: string | null;
  }) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  toggleTaskDone: (taskId: string) => void;

  markInboxRead: (itemId: string, read: boolean) => void;
  markAllInboxRead: () => void;
  dismissInbox: (itemId: string) => void;
  addInbox: (
    item: Omit<InboxItem, "id" | "createdAt" | "read"> & { read?: boolean },
  ) => void;

  updatePlaybook: (playbookId: string, patch: Partial<Playbook>) => void;

  startRun: (playbookId: string) => string;
  advanceRun: (
    runId: string,
    action: "complete_human" | "approve_agent" | "reject_agent",
  ) => void;
  cancelRun: (runId: string) => void;

  addMember: (
    name: string,
    email: string,
    role: TeamMember["role"],
    title?: string,
  ) => void;
  setMemberPresence: (memberId: string, presence: TeamMember["presence"]) => void;

  sendDexMessage: (content: string) => Promise<void>;
  clearDexChat: () => void;
  /** Clear in-memory workspace after sign-out (next user loads from Firestore). */
  resetSessionState: () => void;
};

const emptyWorkspace = (): Omit<
  KlickStore,
  | keyof Pick<
      KlickStore,
      | "setWorkspaceLoadState"
      | "hydrateFromFirestore"
      | "setRemoteSaveSuspended"
      | "getWorkspacePayload"
      | "setWorkspaceName"
      | "setSlackConnected"
      | "setProfile"
      | "addProject"
      | "updateProject"
      | "toggleMilestone"
      | "addIssue"
      | "updateIssue"
      | "addIssueComment"
      | "addDocFolder"
      | "addDoc"
      | "updateDoc"
      | "addChannel"
      | "postMessage"
      | "addTask"
      | "updateTask"
      | "toggleTaskDone"
      | "markInboxRead"
      | "markAllInboxRead"
      | "dismissInbox"
      | "addInbox"
      | "updatePlaybook"
      | "startRun"
      | "advanceRun"
      | "cancelRun"
      | "addMember"
      | "setMemberPresence"
      | "sendDexMessage"
      | "clearDexChat"
      | "resetSessionState"
    >
> => ({
  workspaceLoadState: "idle",
  workspaceLoadError: null,
  remoteSaveSuspended: false,
  workspace: { name: "My workspace", slackConnected: false },
  profile: { displayName: "You", email: "" },
  members: [],
  projects: [],
  issues: [],
  docFolders: [],
  docs: [],
  inbox: [],
  playbooks: [],
  runs: [],
  channels: [],
  messages: [],
  tasks: [],
  dexMessages: initialDexMessages(),
  dexBusy: false,
  dexLastError: null,
});

export const useKlickStore = create<KlickStore>()((set, get) => ({
  ...emptyWorkspace(),

  setWorkspaceLoadState: (state, error = null) =>
    set({ workspaceLoadState: state, workspaceLoadError: error }),

  setRemoteSaveSuspended: (v) => set({ remoteSaveSuspended: v }),

  hydrateFromFirestore: (payload) => {
    set({
      remoteSaveSuspended: true,
      workspace: payload.workspace,
      profile: payload.profile,
      members: payload.members,
      projects: payload.projects,
      issues: payload.issues,
      docFolders: payload.docFolders,
      docs: payload.docs,
      inbox: payload.inbox,
      playbooks: payload.playbooks,
      runs: payload.runs,
      channels: payload.channels,
      messages: payload.messages,
      tasks: payload.tasks,
      dexMessages:
        payload.dexMessages?.length > 0 ? payload.dexMessages : initialDexMessages(),
      workspaceLoadState: "ready",
      workspaceLoadError: null,
    });
    queueMicrotask(() => get().setRemoteSaveSuspended(false));
  },

  getWorkspacePayload: () => toWorkspacePayload(get()),

  setWorkspaceName: (name) => set({ workspace: { ...get().workspace, name } }),
  setSlackConnected: (slackConnected) =>
    set({ workspace: { ...get().workspace, slackConnected } }),
  setProfile: (profile) => set({ profile }),

  addProject: (name, description) => {
    const p: Project = {
      id: id(),
      name,
      description,
      status: "active",
      milestones: [],
    };
    set({ projects: [...get().projects, p] });
  },

  updateProject: (projectId, patch) => {
    set({
      projects: get().projects.map((p) => (p.id === projectId ? { ...p, ...patch } : p)),
    });
  },

  toggleMilestone: (projectId, milestoneId) => {
    set({
      projects: get().projects.map((p) =>
        p.id !== projectId
          ? p
          : {
              ...p,
              milestones: p.milestones.map((m) =>
                m.id === milestoneId ? { ...m, done: !m.done } : m,
              ),
            },
      ),
    });
  },

  addIssue: (partial) => {
    const issueId = id();
    const assigneeId = currentMemberId(get);
    const issue: Issue = {
      id: issueId,
      title: partial.title,
      description: "",
      state: partial.state ?? "backlog",
      priority: partial.priority ?? "medium",
      projectId: partial.projectId,
      assigneeId,
      cycle: null,
      labels: [],
      linkedDocIds: [],
      blockedByIssueIds: [],
      comments: [],
      createdAt: now(),
      updatedAt: now(),
    };
    set({ issues: [...get().issues, issue] });
    return issueId;
  },

  updateIssue: (issueId, patch) => {
    set({
      issues: get().issues.map((i) =>
        i.id === issueId ? { ...i, ...patch, updatedAt: now() } : i,
      ),
    });
  },

  addIssueComment: (issueId, body, agent) => {
    set({
      issues: get().issues.map((i) =>
        i.id === issueId
          ? {
              ...i,
              comments: [
                ...i.comments,
                {
                  id: id(),
                  body,
                  author: agent ? "Klick Agent" : get().profile.displayName,
                  createdAt: now(),
                  agent,
                },
              ],
              updatedAt: now(),
            }
          : i,
      ),
    });
  },

  addDocFolder: (name, parentFolderId, icon = "▢") => {
    const fid = id();
    set({
      docFolders: [...get().docFolders, { id: fid, name, icon, parentFolderId }],
    });
    return fid;
  },

  addDoc: (title, parentId, folderId = null) => {
    const docId = id();
    const doc: Doc = {
      id: docId,
      title,
      parentId,
      folderId,
      content: "",
      linkedIssueIds: [],
      updatedAt: now(),
    };
    set({ docs: [...get().docs, doc] });
    return docId;
  },

  updateDoc: (docId, patch) => {
    set({
      docs: get().docs.map((d) =>
        d.id === docId ? { ...d, ...patch, updatedAt: now() } : d,
      ),
    });
  },

  addChannel: (name, type, topic = "") => {
    const cid = id();
    set({
      channels: [...get().channels, { id: cid, name, type, topic, projectId: null }],
    });
    return cid;
  },

  postMessage: (channelId, body, parentId = null) => {
    const authorId = currentMemberId(get) ?? id();
    const msg: ChannelMessage = {
      id: id(),
      channelId,
      authorId,
      body,
      createdAt: now(),
      parentId,
    };
    set({ messages: [...get().messages, msg] });
  },

  addTask: (partial) => {
    const assigneeId = partial.assigneeId ?? currentMemberId(get);
    const t: Task = {
      id: id(),
      title: partial.title,
      done: false,
      issueId: partial.issueId ?? null,
      projectId: partial.projectId ?? null,
      assigneeId,
      dueAt: partial.dueAt ?? null,
      createdAt: now(),
    };
    set({ tasks: [...get().tasks, t] });
  },

  updateTask: (taskId, patch) => {
    set({
      tasks: get().tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
    });
  },

  toggleTaskDone: (taskId) => {
    set({
      tasks: get().tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    });
  },

  markInboxRead: (itemId, read) => {
    set({
      inbox: get().inbox.map((n) => (n.id === itemId ? { ...n, read } : n)),
    });
  },

  markAllInboxRead: () => {
    set({
      inbox: get().inbox.map((n) => ({ ...n, read: true })),
    });
  },

  dismissInbox: (itemId) => {
    set({ inbox: get().inbox.filter((n) => n.id !== itemId) });
  },

  addInbox: (item) => {
    const row: InboxItem = {
      ...item,
      id: id(),
      read: item.read ?? false,
      createdAt: now(),
    };
    set({ inbox: [row, ...get().inbox] });
  },

  updatePlaybook: (playbookId, patch) => {
    set({
      playbooks: get().playbooks.map((p) =>
        p.id === playbookId ? { ...p, ...patch, updatedAt: now() } : p,
      ),
    });
  },

  startRun: (playbookId) => {
    const pb = get().playbooks.find((p) => p.id === playbookId);
    if (!pb) return "";
    const runId = id();
    let stepLogs = initialLogsForPlaybook(pb);
    stepLogs = activateStep(stepLogs, 0, pb);
    const run: PlaybookRun = {
      id: runId,
      playbookId: pb.id,
      playbookName: pb.name,
      status: "running",
      startedAt: now(),
      completedAt: null,
      currentStepIndex: 0,
      stepLogs,
    };
    set({ runs: [run, ...get().runs] });
    get().addInbox({
      type: "system",
      title: `Run started: ${pb.name}`,
      body: "Open Runs to step through human and agent stages.",
      relatedIssueId: null,
      relatedRunId: runId,
    });
    if (pb.steps[0]?.type === "agent") {
      get().addInbox({
        type: "agent_proposal",
        title: `Approval needed: ${pb.steps[0].title}`,
        body: "Review the draft in Runs.",
        relatedIssueId: null,
        relatedRunId: runId,
      });
    }
    return runId;
  },

  advanceRun: (runId, action) => {
    const state = get();
    const run = state.runs.find((r) => r.id === runId);
    if (!run || run.status !== "running") return;
    const pb = state.playbooks.find((p) => p.id === run.playbookId);
    if (!pb) return;

    const idx = run.currentStepIndex;
    const step = pb.steps[idx];
    if (!step) return;

    const logs = [...run.stepLogs];

    const finishRun = () => {
      set({
        runs: get().runs.map((r) =>
          r.id === runId
            ? {
                ...r,
                status: "completed" as const,
                completedAt: now(),
                stepLogs: logs,
                currentStepIndex: pb.steps.length,
              }
            : r,
        ),
      });
      get().addInbox({
        type: "system",
        title: `Run completed: ${run.playbookName}`,
        body: "All steps finished. Review the log in Runs.",
        relatedIssueId: null,
        relatedRunId: runId,
      });
    };

    const goToNext = () => {
      const nextIdx = idx + 1;
      if (nextIdx >= pb.steps.length) {
        finishRun();
        return;
      }
      let nextLogs = [...logs];
      nextLogs = activateStep(nextLogs, nextIdx, pb);
      set({
        runs: get().runs.map((r) =>
          r.id === runId ? { ...r, currentStepIndex: nextIdx, stepLogs: nextLogs } : r,
        ),
      });
      const ns = pb.steps[nextIdx];
      if (ns?.type === "agent") {
        get().addInbox({
          type: "agent_proposal",
          title: `Approval needed: ${ns.title}`,
          body: "Review the draft in Runs.",
          relatedIssueId: null,
          relatedRunId: runId,
        });
      }
    };

    if (action === "complete_human") {
      if (step.type !== "human" || logs[idx]?.status !== "pending") return;
      logs[idx] = { ...logs[idx], status: "completed" };
      set({
        runs: state.runs.map((r) => (r.id === runId ? { ...r, stepLogs: logs } : r)),
      });
      goToNext();
    }

    if (action === "approve_agent") {
      if (step.type !== "agent" || logs[idx]?.status !== "awaiting_approval") return;
      logs[idx] = {
        ...logs[idx],
        status: "completed",
        approvedAt: now(),
      };
      set({
        runs: get().runs.map((r) => (r.id === runId ? { ...r, stepLogs: logs } : r)),
      });
      goToNext();
    }

    if (action === "reject_agent") {
      if (step.type !== "agent") return;
      const regenerated = activateStep(logs, idx, pb);
      set({
        runs: get().runs.map((r) => (r.id === runId ? { ...r, stepLogs: regenerated } : r)),
      });
    }
  },

  cancelRun: (runId) => {
    set({
      runs: get().runs.map((r) =>
        r.id === runId ? { ...r, status: "cancelled", completedAt: now() } : r,
      ),
    });
  },

  addMember: (name, email, role, title = "Member") => {
    set({
      members: [
        ...get().members,
        {
          id: id(),
          name,
          email,
          role,
          title,
          presence: "offline",
        },
      ],
    });
  },

  setMemberPresence: (memberId, presence) => {
    set({
      members: get().members.map((m) => (m.id === memberId ? { ...m, presence } : m)),
    });
  },

  sendDexMessage: async (content) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const s = get();
    const userMsg: DexMessage = {
      id: id(),
      role: "user",
      content: trimmed,
      createdAt: now(),
    };
    const nextMessages = [...s.dexMessages, userMsg];
    set({ dexMessages: nextMessages, dexBusy: true, dexLastError: null });

    const apiMsgs = nextMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const payload = toWorkspacePayload(get());
    const workspaceContext = buildWorkspaceContextJson(payload);

    try {
      const reply = await fetchDexReply(apiMsgs, workspaceContext);
      const assistantMsg: DexMessage = {
        id: id(),
        role: "assistant",
        content: reply,
        createdAt: now(),
      };
      set({
        dexMessages: [...get().dexMessages, assistantMsg],
        dexBusy: false,
      });
    } catch (e) {
      const ctx = snapshotDexContext({
        workspace: get().workspace,
        issues: get().issues,
        inbox: get().inbox,
        runs: get().runs,
        profile: get().profile,
        members: get().members,
        docs: get().docs,
      });
      const fallback = buildDexReply(trimmed, ctx);
      const errText = e instanceof Error ? e.message : "Dex request failed";
      const assistantMsg: DexMessage = {
        id: id(),
        role: "assistant",
        content: `_${errText}_ — showing offline answer:\n\n${fallback}`,
        createdAt: now(),
      };
      set({
        dexMessages: [...get().dexMessages, assistantMsg],
        dexBusy: false,
        dexLastError: errText,
      });
    }
  },

  clearDexChat: () => set({ dexMessages: initialDexMessages(), dexLastError: null }),

  resetSessionState: () =>
    set({
      ...emptyWorkspace(),
      workspaceLoadState: "idle",
      workspaceLoadError: null,
    }),
}));
