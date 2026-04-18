import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Channel,
  ChannelMessage,
  Doc,
  DocFolder,
  InboxItem,
  Issue,
  Playbook,
  PlaybookRun,
  Priority,
  Project,
  IssueState,
  RunStepLog,
  Task,
  TeamMember,
} from "./types";

const now = () => new Date().toISOString();

function id() {
  return crypto.randomUUID();
}

const seedMembers: TeamMember[] = [
  {
    id: "u1",
    name: "You",
    email: "you@klick.app",
    role: "owner",
    title: "Product lead",
    presence: "active",
  },
  {
    id: "u2",
    name: "Alex Rivera",
    email: "alex@acme.test",
    role: "member",
    title: "Engineer",
    presence: "active",
  },
  {
    id: "u3",
    name: "Sam Okonkwo",
    email: "sam@acme.test",
    role: "admin",
    title: "Ops",
    presence: "away",
  },
  {
    id: "u4",
    name: "Jordan Lee",
    email: "jordan@acme.test",
    role: "member",
    title: "Design",
    presence: "offline",
  },
];

const seedProjects: Project[] = [
  {
    id: "p1",
    name: "Klick v1 launch",
    description: "Ship the first production-ready workspace.",
    status: "active",
    milestones: [
      { id: "m1", name: "Design freeze", dueDate: "2026-04-20", done: true },
      { id: "m2", name: "Beta cohort", dueDate: "2026-05-01", done: false },
      { id: "m3", name: "GA", dueDate: "2026-05-15", done: false },
    ],
  },
  {
    id: "p2",
    name: "Integrations platform",
    description: "Slack, GitHub, and Notion connectors.",
    status: "active",
    milestones: [
      { id: "m4", name: "Slack OAuth", dueDate: "2026-04-25", done: false },
      { id: "m5", name: "Webhook v1", dueDate: null, done: false },
    ],
  },
];

const seedIssues: Issue[] = [
  {
    id: "i1",
    title: "Wire playbook runner to inbox notifications",
    description: "When a run completes or needs approval, surface in Inbox.",
    state: "in_progress",
    priority: "high",
    projectId: "p1",
    assigneeId: "u1",
    cycle: "2026-W16",
    labels: ["agent", "product"],
    linkedDocIds: ["d1"],
    blockedByIssueIds: [],
    comments: [
      {
        id: "c1",
        body: "Drafted the event types—will hook up after review.",
        author: "You",
        createdAt: now(),
      },
      {
        id: "c2",
        body: "Suggested copy for inbox cards based on run state transitions.",
        author: "Klick Agent",
        createdAt: now(),
        agent: true,
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "i2",
    title: "Polish Issues board filters",
    description: "Saved views for cycle + assignee.",
    state: "todo",
    priority: "medium",
    projectId: "p1",
    assigneeId: "u2",
    cycle: "2026-W16",
    labels: ["ux"],
    linkedDocIds: [],
    blockedByIssueIds: [],
    comments: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "i3",
    title: "Slack OAuth happy path",
    description: "Connect workspace and post first mirror message.",
    state: "backlog",
    priority: "urgent",
    projectId: "p2",
    assigneeId: null,
    cycle: null,
    labels: ["integrations"],
    linkedDocIds: [],
    blockedByIssueIds: ["i2"],
    comments: [],
    createdAt: now(),
    updatedAt: now(),
  },
];

const seedDocFolders: DocFolder[] = [
  { id: "f1", name: "Product", icon: "◆", parentFolderId: null },
  { id: "f2", name: "Engineering", icon: "◇", parentFolderId: null },
  { id: "f3", name: "Specs", icon: "▫", parentFolderId: "f1" },
];

const seedDocs: Doc[] = [
  {
    id: "d1",
    title: "Playbook runtime spec",
    parentId: null,
    folderId: "f3",
    content:
      "# Playbook runtime\n\nHuman and agent steps execute in order. Agent steps with **draft** autonomy require approval before continuing.\n\n## Links\n- Related issue: see Issues list",
    linkedIssueIds: ["i1"],
    updatedAt: now(),
  },
  {
    id: "d2",
    title: "Weekly decision log",
    parentId: null,
    folderId: "f1",
    content:
      "## 2026-04-10\n**Decision:** Ship local-first storage for v1.\n**Why:** Faster iteration; swap for API later.",
    linkedIssueIds: [],
    updatedAt: now(),
  },
  {
    id: "d3",
    title: "API contracts (draft)",
    parentId: null,
    folderId: "f2",
    content: "## Endpoints\n- `POST /runs` — start playbook\n- `GET /issues` — list",
    linkedIssueIds: [],
    updatedAt: now(),
  },
  {
    id: "d4",
    title: "Runtime — threading model",
    parentId: "d1",
    folderId: "f3",
    content: "Nested page: how inbox + threads map to channel mirrors.",
    linkedIssueIds: [],
    updatedAt: now(),
  },
];

const seedPlaybooks: Playbook[] = [
  {
    id: "pb1",
    name: "Weekly product sync",
    description: "Collect updates, draft summary, notify Slack when connected.",
    steps: [
      {
        id: "s1",
        type: "human",
        title: "Gather team updates",
        description: "Each lead drops notes in the linked doc.",
        autonomy: null,
      },
      {
        id: "s2",
        type: "agent",
        title: "Draft weekly summary",
        description: "Agent compiles highlights and risks from Issues + Docs.",
        autonomy: "draft",
      },
      {
        id: "s3",
        type: "human",
        title: "Publish summary",
        description: "Review and send to stakeholders.",
        autonomy: null,
      },
    ],
    updatedAt: now(),
  },
  {
    id: "pb2",
    name: "Launch readiness",
    description: "Checklist-style run with a single agent assist for comms draft.",
    steps: [
      {
        id: "l1",
        type: "human",
        title: "Verify release criteria",
        description: "All P0 issues closed or waived.",
        autonomy: null,
      },
      {
        id: "l2",
        type: "agent",
        title: "Draft announcement",
        description: "Agent proposes changelog blurb and Slack message.",
        autonomy: "draft",
      },
    ],
    updatedAt: now(),
  },
];

const seedInbox: InboxItem[] = [
  {
    id: "n1",
    type: "agent_proposal",
    title: "Agent: summarize issue i1",
    body: "Suggested summary: Playbook events should post to Inbox with approve/dismiss actions.",
    read: false,
    createdAt: now(),
    relatedIssueId: "i1",
    relatedRunId: null,
  },
  {
    id: "n2",
    type: "mention",
    title: "Alex mentioned you in i2",
    body: "Can you pair on filters tomorrow?",
    read: false,
    createdAt: now(),
    relatedIssueId: "i2",
    relatedRunId: null,
  },
  {
    id: "n3",
    type: "slack_mirror",
    title: "#product-launch: new thread",
    body: "Mirrored: “Need sign-off on copy for the hero.” Open Threads to reply.",
    read: false,
    createdAt: now(),
    relatedIssueId: null,
    relatedRunId: null,
    relatedChannelId: "ch1",
  },
  {
    id: "n4",
    type: "system",
    title: "Welcome to Klick",
    body: "Try running “Weekly product sync” from Playbooks to see orchestration end-to-end.",
    read: true,
    createdAt: now(),
    relatedIssueId: null,
    relatedRunId: null,
  },
];

const seedChannels: Channel[] = [
  {
    id: "ch1",
    name: "product-launch",
    type: "public",
    topic: "Shipping v1 · decisions + blockers",
    projectId: "p1",
  },
  {
    id: "ch2",
    name: "eng",
    type: "public",
    topic: "Build chatter",
    projectId: null,
  },
  {
    id: "ch3",
    name: "alex-rivera",
    type: "dm",
    topic: "Direct messages",
    projectId: null,
  },
];

const seedMessages: ChannelMessage[] = [
  {
    id: "msg1",
    channelId: "ch1",
    authorId: "u2",
    body: "Blocked on copy for the landing hero—who owns final sign-off?",
    createdAt: now(),
    parentId: null,
  },
  {
    id: "msg2",
    channelId: "ch1",
    authorId: "u1",
    body: "I’ll take it—syncing with design this afternoon.",
    createdAt: now(),
    parentId: "msg1",
  },
  {
    id: "msg3",
    channelId: "ch1",
    authorId: "u3",
    body: "Agent draft: weekly risks are in the playbook run log if you need bullets for standup.",
    createdAt: now(),
    parentId: null,
    agent: true,
  },
  {
    id: "msg4",
    channelId: "ch2",
    authorId: "u2",
    body: "CI is green on `main`.",
    createdAt: now(),
    parentId: null,
  },
];

const seedTasks: Task[] = [
  {
    id: "t1",
    title: "Record Loom for playbook approval flow",
    done: false,
    issueId: "i1",
    projectId: "p1",
    assigneeId: "u1",
    dueAt: "2026-04-18",
    createdAt: now(),
  },
  {
    id: "t2",
    title: "QA saved views on mobile width",
    done: false,
    issueId: "i2",
    projectId: "p1",
    assigneeId: "u2",
    dueAt: null,
    createdAt: now(),
  },
  {
    id: "t3",
    title: "Prep OAuth app for Slack sandbox",
    done: true,
    issueId: "i3",
    projectId: "p2",
    assigneeId: "u3",
    dueAt: null,
    createdAt: now(),
  },
  {
    id: "t4",
    title: "Review Q2 roadmap draft",
    done: false,
    issueId: null,
    projectId: "p1",
    assigneeId: "u1",
    dueAt: "2026-04-22",
    createdAt: now(),
  },
];

type KlickStore = {
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

  resetDemo: () => void;
};

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

function cloneSeed<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export const useKlickStore = create<KlickStore>()(
  persist(
    (set, get) => ({
      workspace: { name: "Acme Labs", slackConnected: false },
      profile: { displayName: "You", email: "you@klick.app" },
      members: seedMembers,
      projects: seedProjects,
      issues: seedIssues,
      docFolders: seedDocFolders,
      docs: seedDocs,
      inbox: seedInbox,
      playbooks: seedPlaybooks,
      runs: [],
      channels: seedChannels,
      messages: seedMessages,
      tasks: seedTasks,

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
        const issue: Issue = {
          id: issueId,
          title: partial.title,
          description: "",
          state: partial.state ?? "backlog",
          priority: partial.priority ?? "medium",
          projectId: partial.projectId,
          assigneeId: "u1",
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
          docFolders: [
            ...get().docFolders,
            { id: fid, name, icon, parentFolderId },
          ],
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
          channels: [
            ...get().channels,
            { id: cid, name, type, topic, projectId: null },
          ],
        });
        return cid;
      },

      postMessage: (channelId, body, parentId = null) => {
        const msg: ChannelMessage = {
          id: id(),
          channelId,
          authorId: "u1",
          body,
          createdAt: now(),
          parentId,
        };
        set({ messages: [...get().messages, msg] });
      },

      addTask: (partial) => {
        const t: Task = {
          id: id(),
          title: partial.title,
          done: false,
          issueId: partial.issueId ?? null,
          projectId: partial.projectId ?? null,
          assigneeId: partial.assigneeId ?? "u1",
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
          tasks: get().tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t,
          ),
        });
      },

      markInboxRead: (itemId, read) => {
        set({
          inbox: get().inbox.map((n) => (n.id === itemId ? { ...n, read } : n)),
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
              r.id === runId
                ? { ...r, currentStepIndex: nextIdx, stepLogs: nextLogs }
                : r,
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
          members: get().members.map((m) =>
            m.id === memberId ? { ...m, presence } : m,
          ),
        });
      },

      resetDemo: () => {
        set({
          workspace: { name: "Acme Labs", slackConnected: false },
          profile: { displayName: "You", email: "you@klick.app" },
          members: cloneSeed(seedMembers),
          projects: cloneSeed(seedProjects),
          issues: cloneSeed(seedIssues),
          docFolders: cloneSeed(seedDocFolders),
          docs: cloneSeed(seedDocs),
          inbox: cloneSeed(seedInbox),
          playbooks: cloneSeed(seedPlaybooks),
          runs: [],
          channels: cloneSeed(seedChannels),
          messages: cloneSeed(seedMessages),
          tasks: cloneSeed(seedTasks),
        });
      },
    }),
    {
      name: "klick-storage-v2",
      version: 2,
    },
  ),
);

function mockAgentOutput(title: string): string {
  return `[Agent draft]\n\n## ${title}\n\n- Highlight: team velocity up week over week.\n- Risk: two P1 issues still in backlog.\n- Next: align on scope for Slack mirror v2.\n\n_Edit after approval or reject to retry._`;
}
