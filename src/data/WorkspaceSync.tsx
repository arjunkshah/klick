import { useEffect, useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { isFirebaseConfigured } from "../lib/firebase";
import {
  saveWorkspaceDebounced,
  subscribePrivateIntegrations,
  subscribeWorkspace,
} from "../lib/firestoreWorkspace";
import { useKlickStore } from "./store";

export function WorkspaceSync() {
  const { user, status } = useAuth();
  const configured = isFirebaseConfigured();
  const uid = user?.uid ?? null;
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!configured) {
      useKlickStore.getState().setWorkspaceLoadState("ready");
      return;
    }
    if (status !== "ready") {
      useKlickStore.getState().setWorkspaceLoadState("loading");
      return;
    }
    if (!uid) {
      useKlickStore.getState().setWorkspaceLoadState("idle");
      return;
    }

    useKlickStore.getState().setWorkspaceLoadState("loading");

    const unsub = subscribeWorkspace(
      uid,
      (payload) => {
        useKlickStore.getState().hydrateFromFirestore(payload);
      },
      (err) => {
        useKlickStore.getState().setWorkspaceLoadState("error", err.message);
      },
      () => {
        const s = useKlickStore.getState();
        return { email: s.profile.email, displayName: s.profile.displayName };
      },
    );
    unsubRef.current = unsub;
    return () => {
      unsub();
      unsubRef.current = null;
    };
  }, [configured, uid, status]);

  useEffect(() => {
    if (!configured || !uid) {
      useKlickStore.getState().hydratePrivateIntegrations({});
      return;
    }
    const unsub = subscribePrivateIntegrations(
      uid,
      (data) => {
        useKlickStore.getState().hydratePrivateIntegrations(data);
        const s = useKlickStore.getState();
        const slackOk = Boolean(data.slack?.accessToken);
        const ghOk = Boolean(data.github?.accessToken);
        const cal = data.googleCalendar;
        const calOk = Boolean(
          cal?.accessToken && (!cal.expiresAt || cal.expiresAt > Date.now() + 30_000),
        );
        const w = s.workspace;
        const nextSlackWorkspace =
          slackOk && data.slack?.teamName ? data.slack.teamName : undefined;
        if (
          w.slackConnected !== slackOk ||
          w.githubConnected !== ghOk ||
          w.googleCalendarConnected !== calOk ||
          (slackOk && nextSlackWorkspace !== w.slackWorkspace) ||
          (!slackOk && w.slackWorkspace)
        ) {
          s.patchWorkspace({
            slackConnected: slackOk,
            slackWorkspace: slackOk ? nextSlackWorkspace : undefined,
            githubConnected: ghOk,
            googleCalendarConnected: calOk,
          });
        }
      },
      () => {},
    );
    return () => unsub();
  }, [configured, uid]);

  useEffect(() => {
    if (!configured || !uid) return;

    const unsub = useKlickStore.subscribe((state) => {
      if (state.remoteSaveSuspended) return;
      if (state.workspaceLoadState !== "ready") return;
      saveWorkspaceDebounced(uid, state.getWorkspacePayload());
    });

    return () => unsub();
  }, [configured, uid]);

  return null;
}
