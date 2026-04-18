import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { useKlickStore } from "../data/store";
import { getFirebaseAuth } from "../lib/firebase";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./authContext";
import { clearSession, getSession, setSession } from "./session";

function syncSessionFromUser(user: User) {
  const email = user.email;
  if (!email) return;
  const workspaceName = getSession()?.workspaceName ?? useKlickStore.getState().workspace.name;
  const displayName =
    user.displayName?.trim() ||
    email.split("@")[0]?.replace(/\./g, " ") ||
    "You";
  setSession({ email, displayName, workspaceName });
  useKlickStore.getState().setProfile({ displayName, email });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useMemo(() => getFirebaseAuth(), []);
  const [status, setStatus] = useState<AuthStatus>(() => (auth ? "loading" : "ready"));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      if (next) syncSessionFromUser(next);
      else clearSession();
      setStatus("ready");
    });
  }, [auth]);

  const configured = Boolean(auth);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      configured,
      signInWithGoogle: async () => {
        if (!auth) throw new Error("Firebase is not configured.");
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
      },
      signInWithEmailPassword: async (email, password) => {
        if (!auth) throw new Error("Firebase is not configured.");
        await signInWithEmailAndPassword(auth, email, password);
      },
      signUpWithEmailPassword: async (email, password, displayName) => {
        if (!auth) throw new Error("Firebase is not configured.");
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName?.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
      },
      signOutUser: async () => {
        clearSession();
        if (auth) await signOut(auth);
      },
    }),
    [auth, configured, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
