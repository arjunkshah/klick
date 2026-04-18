import { useEffect, useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { isFirebaseConfigured } from "../lib/firebase";
import { saveWorkspaceDebounced, subscribeWorkspace } from "../lib/firestoreWorkspace";
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
