/** Workspace-level flags (persisted with workspace doc). */
export type WorkspaceMeta = {
  name: string;
  slackConnected: boolean;
  /** Slack workspace or team name when connected (display only / demo). */
  slackWorkspace?: string;
  googleCalendarConnected?: boolean;
  githubConnected?: boolean;
  /**
   * First-run onboarding. Missing in older Firestore docs = treated as complete.
   * New workspaces start with false until the user finishes onboarding.
   */
  onboardingDone?: boolean;
};

/** Sensitive tokens — Firestore doc `users/{uid}/klick/privateIntegrations` (never in Dex payload). */
export type PrivateIntegrations = {
  slack?: {
    accessToken: string;
    teamId: string;
    teamName: string;
    scope: string;
    connectedAt: string;
  };
  github?: {
    accessToken: string;
    login: string;
    scope: string;
    connectedAt: string;
  };
  googleCalendar?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    connectedAt: string;
  };
};

export type IssueState = "backlog" | "todo" | "in_progress" | "done" | "canceled";
export type Priority = "low" | "medium" | "high" | "urgent";

export type Milestone = {
  id: string;
  name: string;
  dueDate: string | null;
  done: boolean;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "archived";
  milestones: Milestone[];
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  state: IssueState;
  priority: Priority;
  projectId: string;
  assigneeId: string | null;
  cycle: string | null;
  labels: string[];
  linkedDocIds: string[];
  blockedByIssueIds: string[];
  comments: { id: string; body: string; author: string; createdAt: string; agent?: boolean }[];
  createdAt: string;
  updatedAt: string;
};

export type DocFolder = {
  id: string;
  name: string;
  icon: string;
  parentFolderId: string | null;
};

export type Doc = {
  id: string;
  title: string;
  parentId: string | null;
  folderId: string | null;
  content: string;
  linkedIssueIds: string[];
  updatedAt: string;
};

export type InboxItemType = "mention" | "agent_proposal" | "slack_mirror" | "system";

export type InboxItem = {
  id: string;
  type: InboxItemType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  relatedIssueId: string | null;
  relatedRunId: string | null;
  relatedChannelId?: string | null;
};

export type PlaybookStepType = "human" | "agent";

export type AutonomyLevel = "suggest" | "draft" | "run";

export type PlaybookStep = {
  id: string;
  type: PlaybookStepType;
  title: string;
  description: string;
  autonomy: AutonomyLevel | null;
};

export type Playbook = {
  id: string;
  name: string;
  description: string;
  steps: PlaybookStep[];
  updatedAt: string;
};

export type RunStepStatus =
  | "pending"
  | "running"
  | "awaiting_approval"
  | "completed"
  | "skipped";

export type RunStepLog = {
  stepId: string;
  title: string;
  type: PlaybookStepType;
  status: RunStepStatus;
  output?: string;
  approvedAt?: string;
};

export type PlaybookRun = {
  id: string;
  playbookId: string;
  playbookName: string;
  status: "running" | "completed" | "cancelled";
  startedAt: string;
  completedAt: string | null;
  currentStepIndex: number;
  stepLogs: RunStepLog[];
};

export type DexMessageRole = "user" | "assistant";

export type DexMessage = {
  id: string;
  role: DexMessageRole;
  content: string;
  createdAt: string;
};

/** One Dex conversation thread (persisted in workspace). */
export type DexChat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: DexMessage[];
};

export type MemberPresence = "active" | "away" | "offline";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  title: string;
  presence: MemberPresence;
};

export type ChannelType = "public" | "private" | "dm";

export type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  topic: string;
  projectId: string | null;
};

export type ChannelMessage = {
  id: string;
  channelId: string;
  authorId: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  agent?: boolean;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  issueId: string | null;
  projectId: string | null;
  assigneeId: string | null;
  dueAt: string | null;
  createdAt: string;
};
