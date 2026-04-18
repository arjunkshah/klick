import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { mapFirebaseAuthError } from "../auth/mapFirebaseAuthError";
import { AuthShader } from "../components/AuthShader";
import { GoogleMark } from "../components/GoogleMark";
import { KlickLogo } from "../components/KlickLogo";
import { isFirebaseConfigured } from "../lib/firebase";
import { useKlickStore } from "../data/store";

type Mode = "signin" | "signup";

export function AuthSplitScreen({ mode }: { mode: Mode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/app";
  const setWorkspaceName = useKlickStore((s) => s.setWorkspaceName);
  const {
    status,
    user,
    configured,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
  } = useAuth();

  const [workspace, setWorkspace] = useState("My team");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = status === "ready";
  const isSignup = mode === "signup";
  const envOk = isFirebaseConfigured();

  if (ready && user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="auth-split">
      <div className="auth-split__shader" aria-hidden>
        <AuthShader />
        <div className="auth-split__shader-grain" />
      </div>

      <div className="auth-split__panel">
        <Link
          to="/"
          className="auth-split__home text-theme-text no-underline transition-opacity duration-[var(--duration)] hover:opacity-80"
          aria-label="Klick home"
        >
          <KlickLogo />
        </Link>

        <div className="auth-split__content">
          <h1 className="auth-split__title">
            {isSignup ? "Create account" : "Log in"}
          </h1>

          {!envOk ? (
            <p className="auth-split__hint">
              Add <code className="auth-split__code">VITE_FIREBASE_*</code> to{" "}
              <code className="auth-split__code">.env.local</code>
            </p>
          ) : null}

          {error ? (
            <div className="auth-split__error" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            className="auth-split__google"
            disabled={!configured || busy || !envOk}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                if (isSignup) setWorkspaceName(workspace);
                await signInWithGoogle();
                nav(isSignup ? "/app" : from, { replace: true });
              } catch (e) {
                setError(mapFirebaseAuthError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            <GoogleMark />
            <span>Continue with Google</span>
          </button>

          <div className="auth-split__rule" aria-hidden>
            <span>or</span>
          </div>

          <form
            className="auth-split__form"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError(null);
              try {
                if (isSignup) {
                  setWorkspaceName(workspace);
                  const displayName = email.split("@")[0]?.replace(/\./g, " ") ?? "You";
                  await signUpWithEmailPassword(email, password, displayName);
                  nav("/app", { replace: true });
                } else {
                  await signInWithEmailPassword(email, password);
                  nav(from, { replace: true });
                }
              } catch (err) {
                setError(mapFirebaseAuthError(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            {isSignup ? (
              <label className="auth-split__field">
                <span className="auth-split__label">Workspace</span>
                <input
                  className="auth-split__input"
                  value={workspace}
                  onChange={(ev) => setWorkspace(ev.target.value)}
                  required
                  autoComplete="organization"
                  disabled={!configured || !envOk}
                />
              </label>
            ) : null}

            <label className="auth-split__field">
              <span className="auth-split__label">Email</span>
              <input
                className="auth-split__input"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                type="email"
                required
                autoComplete="email"
                disabled={!configured || !envOk}
              />
            </label>

            <label className="auth-split__field">
              <span className="auth-split__label">Password</span>
              <input
                className="auth-split__input"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                type="password"
                required
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={6}
                disabled={!configured || !envOk}
              />
            </label>

            <button
              type="submit"
              className="auth-split__submit"
              disabled={!configured || busy || !envOk}
            >
              {busy
                ? isSignup
                  ? "Creating…"
                  : "Signing in…"
                : isSignup
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <p className="auth-split__switch">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link to="/login" state={loc.state} className="auth-split__switch-link">
                  Log in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link to="/signup" state={loc.state} className="auth-split__switch-link">
                  Create account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
