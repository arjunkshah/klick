import { doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type {
  Channel,
  ChannelMessage,
  DexMessage,
  Doc,
  DocFolder,
  InboxItem,
  Issue,
  Playbook,
  PlaybookRun,
  Project,
  Task,
  TeamMember,
} from "../data/types";

/** Single-document workspace payload (no UI-only fields). */
export type WorkspacePayload = {
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
};

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
    workspace: { name: "My workspace", slackConnected: false },
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
    dexMessages: [
      {
        id: "dex-welcome",
        role: "assistant",
        content:
          "I’m **Dex**. I’m grounded in your workspace data in Firebase. Ask for a summary, what’s blocked, or what to tackle next.",
        createdAt: new Date().toISOString(),
      },
    ],
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
    dexMessages: Array.isArray(raw.dexMessages) ? (raw.dexMessages as DexMessage[]) : [],
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
