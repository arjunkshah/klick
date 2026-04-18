import { createContext } from "react";
import type { User } from "firebase/auth";

export type AuthStatus = "loading" | "ready";

export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signOutUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
