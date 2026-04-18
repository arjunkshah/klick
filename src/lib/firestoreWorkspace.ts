import { doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type {
  Channel,
  ChannelMessage,
  DexChat,
  DexMessage,
  Doc,
  DocFolder,
  InboxItem,
  Issue,
  Playbook,
  PlaybookRun,
  PrivateIntegrations,
  Project,
  Task,
  TeamMember,
  WorkspaceMeta,
} from "../data/types";

/** Single-document workspace payload (no UI-only fields). */
export type WorkspacePayload = {
  workspace: WorkspaceMeta;
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
  dexChats: DexChat[];
  dexActiveChatId: string;
};

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEX_WELCOME: DexMessage[] = [
  {
    id: "dex-welcome",
    role: "assistant",
    content:
      "I’m **Dex**. I’m grounded in your workspace data in Firebase. Ask for a summary, what’s blocked, or what to tackle next.",
    createdAt: new Date().toISOString(),
  },
];

function dexChatsFromFirestore(raw: Record<string, unknown>): { dexChats: DexChat[]; dexActiveChatId: string } {
  const arr = raw.dexChats;
  if (Array.isArray(arr) && arr.length > 0) {
    const chats: DexChat[] = arr
      .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object")
      .map((x) => {
        const msgs = Array.isArray(x.messages) ? (x.messages as DexMessage[]) : [...DEX_WELCOME];
        const created = String(x.createdAt ?? new Date().toISOString());
        return {
          id: String(x.id ?? newId()),
          title: String(x.title ?? "Chat"),
          createdAt: created,
          updatedAt: String(x.updatedAt ?? created),
          messages: msgs.length > 0 ? msgs : [...DEX_WELCOME],
        };
      });
    const activeRaw = raw.dexActiveChatId;
    const activeId =
      typeof activeRaw === "string" && chats.some((c) => c.id === activeRaw) ? activeRaw : chats[0]!.id;
    return { dexChats: chats, dexActiveChatId: activeId };
  }

  const legacy = Array.isArray(raw.dexMessages) ? (raw.dexMessages as DexMessage[]) : [];
  if (legacy.length > 0) {
    const t = new Date().toISOString();
    const cid = newId();
    return {
      dexChats: [
        {
          id: cid,
          title: "Chat",
          createdAt: t,
          updatedAt: t,
          messages: legacy,
        },
      ],
      dexActiveChatId: cid,
    };
  }

  const t = new Date().toISOString();
  const cid = newId();
  return {
    dexChats: [
      {
        id: cid,
        title: "New chat",
        createdAt: t,
        updatedAt: t,
        messages: [...DEX_WELCOME],
      },
    ],
    dexActiveChatId: cid,
  };
}

export function workspaceDocRef(uid: string) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore is not configured.");
  return doc(db, "users", uid, "klick", "state");
}

export function defaultWorkspacePayload(
  uid: string,
  email: string,
  displayName: string,
): WorkspacePayload {
  return {
    workspace: {
      name: "My workspace",
      slackConnected: false,
      slackWorkspace: undefined,
      googleCalendarConnected: false,
      githubConnected: false,
      onboardingDone: false,
    },
    profile: { displayName, email },
    members: [
      {
        id: uid,
        name: displayName,
        email,
        role: "owner",
        title: "Owner",
        presence: "active",
      },
    ],
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
    ...(() => {
      const t = new Date().toISOString();
      const cid = newId();
      return {
        dexChats: [
          {
            id: cid,
            title: "New chat",
            createdAt: t,
            updatedAt: t,
            messages: [...DEX_WELCOME],
          },
        ],
        dexActiveChatId: cid,
      };
    })(),
  };
}

function normalizePayload(raw: Record<string, unknown>): WorkspacePayload | null {
  if (!raw || typeof raw !== "object") return null;
  const w = raw.workspace;
  const p = raw.profile;
  if (!w || typeof w !== "object" || !p || typeof p !== "object") return null;
  return {
    workspace: {
      name: String((w as { name?: string }).name ?? "Workspace"),
      slackConnected: Boolean((w as { slackConnected?: boolean }).slackConnected),
      slackWorkspace:
        typeof (w as { slackWorkspace?: string }).slackWorkspace === "string"
          ? (w as { slackWorkspace: string }).slackWorkspace
          : undefined,
      googleCalendarConnected: Boolean((w as { googleCalendarConnected?: boolean }).googleCalendarConnected),
      githubConnected: Boolean((w as { githubConnected?: boolean }).githubConnected),
      onboardingDone:
        typeof (w as { onboardingDone?: boolean }).onboardingDone === "boolean"
          ? (w as { onboardingDone: boolean }).onboardingDone
          : true,
    },
    profile: {
      displayName: String((p as { displayName?: string }).displayName ?? "You"),
      email: String((p as { email?: string }).email ?? ""),
    },
    members: Array.isArray(raw.members) ? (raw.members as TeamMember[]) : [],
    projects: Array.isArray(raw.projects) ? (raw.projects as Project[]) : [],
    issues: Array.isArray(raw.issues) ? (raw.issues as Issue[]) : [],
    docFolders: Array.isArray(raw.docFolders) ? (raw.docFolders as DocFolder[]) : [],
    docs: Array.isArray(raw.docs) ? (raw.docs as Doc[]) : [],
    inbox: Array.isArray(raw.inbox) ? (raw.inbox as InboxItem[]) : [],
    playbooks: Array.isArray(raw.playbooks) ? (raw.playbooks as Playbook[]) : [],
    runs: Array.isArray(raw.runs) ? (raw.runs as PlaybookRun[]) : [],
    channels: Array.isArray(raw.channels) ? (raw.channels as Channel[]) : [],
    messages: Array.isArray(raw.messages) ? (raw.messages as ChannelMessage[]) : [],
    tasks: Array.isArray(raw.tasks) ? (raw.tasks as Task[]) : [],
    ...dexChatsFromFirestore(raw),
  };
}

export function subscribeWorkspace(
  uid: string,
  onData: (payload: WorkspacePayload) => void,
  onError: (err: Error) => void,
  seedProfile?: () => { email: string; displayName: string },
): Unsubscribe {
  const ref = workspaceDocRef(uid);
  return onSnapshot(
    ref,
    async (snap) => {
      try {
        if (!snap.exists()) {
          const seed = seedProfile?.() ?? { email: "", displayName: "You" };
          const email = seed.email || "";
          const displayName = seed.displayName?.trim() || "You";
          const initial = defaultWorkspacePayload(uid, email, displayName);
          await setDoc(ref, initial);
          onData(initial);
          return;
        }
        const parsed = normalizePayload(snap.data() as Record<string, unknown>);
        if (parsed) onData(parsed);
        else onError(new Error("Invalid workspace document shape."));
      } catch (e) {
        onError(e instanceof Error ? e : new Error(String(e)));
      }
    },
    (err) => onError(err),
  );
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastSerialized = "";

export function saveWorkspaceDebounced(uid: string, payload: WorkspacePayload, delayMs = 700) {
  const json = JSON.stringify(payload);
  if (json === lastSerialized) return;
  lastSerialized = json;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try {
      await setDoc(workspaceDocRef(uid), payload);
    } catch {
      lastSerialized = "";
    }
  }, delayMs);
}

export function flushWorkspaceSave(uid: string, payload: WorkspacePayload) {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  lastSerialized = JSON.stringify(payload);
  return setDoc(workspaceDocRef(uid), payload);
}

function normalizePrivateIntegrations(raw: Record<string, unknown> | undefined): PrivateIntegrations {
  if (!raw) return {};
  const out: PrivateIntegrations = {};
  const slackRaw = raw.slack;
  if (slackRaw && typeof slackRaw === "object" && typeof (slackRaw as { accessToken?: unknown }).accessToken === "string") {
    const s = slackRaw as Record<string, unknown>;
    out.slack = {
      accessToken: String(s.accessToken),
      teamId: String(s.teamId ?? ""),
      teamName: String(s.teamName ?? ""),
      scope: String(s.scope ?? ""),
      connectedAt: String(s.connectedAt ?? ""),
    };
  }
  const ghRaw = raw.github;
  if (ghRaw && typeof ghRaw === "object" && typeof (ghRaw as { accessToken?: unknown }).accessToken === "string") {
    const g = ghRaw as Record<string, unknown>;
    out.github = {
      accessToken: String(g.accessToken),
      login: String(g.login ?? ""),
      scope: String(g.scope ?? ""),
      connectedAt: String(g.connectedAt ?? ""),
    };
  }
  const calRaw = raw.googleCalendar;
  if (calRaw && typeof calRaw === "object" && typeof (calRaw as { accessToken?: unknown }).accessToken === "string") {
    const c = calRaw as Record<string, unknown>;
    out.googleCalendar = {
      accessToken: String(c.accessToken),
      refreshToken: typeof c.refreshToken === "string" ? c.refreshToken : undefined,
      expiresAt: typeof c.expiresAt === "number" ? c.expiresAt : Number(c.expiresAt) || 0,
      connectedAt: String(c.connectedAt ?? ""),
    };
  }
  return out;
}

export function subscribePrivateIntegrations(
  uid: string,
  onData: (data: PrivateIntegrations) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  if (!db) {
    onData({});
    return () => {};
  }
  const ref = doc(db, "users", uid, "klick", "privateIntegrations");
  return onSnapshot(
    ref,
    (snap) => {
      onData(snap.exists() ? normalizePrivateIntegrations(snap.data() as Record<string, unknown>) : {});
    },
    (err) => onError(err),
  );
}
