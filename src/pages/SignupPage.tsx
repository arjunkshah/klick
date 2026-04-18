import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { mapFirebaseAuthError } from "../auth/mapFirebaseAuthError";
import { isFirebaseConfigured } from "../lib/firebase";
import { GoogleMark } from "../components/GoogleMark";
import { KlickLogo } from "../components/KlickLogo";
import { useKlickStore } from "../data/store";

export function SignupPage() {
  const nav = useNavigate();
  const setWorkspaceName = useKlickStore((s) => s.setWorkspaceName);
  const { status, user, configured, signInWithGoogle, signUpWithEmailPassword } = useAuth();

  const [workspace, setWorkspace] = useState("My team");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = status === "ready";

  if (ready && user) {
    return <Navigate to="/app" replace />;
  }

  const envOk = isFirebaseConfigured();

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <div className="container grid h-[var(--site-header-height)] w-full max-w-none grid-cols-[1fr_auto] items-center">
          <Link
            to="/"
            className="relative left-[-2px] top-[0.15rem] inline-flex items-center text-theme-text no-underline transition-opacity duration-[var(--duration)] hover:opacity-88"
            aria-label="Klick home"
          >
            <KlickLogo />
          </Link>
          <Link className="btn btn--ghost btn--sm no-underline" to="/login">
            Sign in
          </Link>
        </div>
      </header>

      <main className="auth-page__main">
        <div className="auth-page__panel">
          <div className="card card--large">
            <p className="auth-eyebrow">Account</p>
            <h1 className="auth-title type-md text-balance">Create workspace</h1>
            <p className="auth-lede text-pretty">
              Use Google or email. Demo data stays in this browser — local-first by default.
            </p>

            {!envOk ? (
              <div className="auth-callout">
                Add Firebase web config to <code>.env.local</code> — see <code>.env.example</code>.
              </div>
            ) : null}

            {error ? (
              <div className="auth-error" role="alert">
                {error}
              </div>
            ) : null}

            <div className="auth-stack">
              <button
                type="button"
                className="auth-google-btn btn btn--secondary w-full justify-center gap-2 transition-transform duration-[var(--duration)] active:scale-[0.99] disabled:opacity-50"
                disabled={!configured || busy || !envOk}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    setWorkspaceName(workspace);
                    await signInWithGoogle();
                    nav("/app", { replace: true });
                  } catch (e) {
                    setError(mapFirebaseAuthError(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <GoogleMark />
                Continue with Google
              </button>

              <div className="auth-divider" aria-hidden>
                <span>or</span>
              </div>

              <form
                className="flex flex-col gap-v2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError(null);
                  try {
                    setWorkspaceName(workspace);
                    const displayName = email.split("@")[0]?.replace(/\./g, " ") ?? "You";
                    await signUpWithEmailPassword(email, password, displayName);
                    nav("/app", { replace: true });
                  } catch (err) {
                    setError(mapFirebaseAuthError(err));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="signup-workspace">
                    Workspace name
                  </label>
                  <input
                    id="signup-workspace"
                    className="auth-field-input"
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                    required
                    autoComplete="organization"
                    disabled={!configured || !envOk}
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="signup-email">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    className="auth-field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    autoComplete="email"
                    disabled={!configured || !envOk}
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="signup-password">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    className="auth-field-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    disabled={!configured || !envOk}
                  />
                </div>
                <button
                  type="submit"
                  className="btn mt-v8/12 w-full justify-center disabled:opacity-50"
                  disabled={!configured || busy || !envOk}
                >
                  {busy ? "Creating…" : "Get started"}
                </button>
              </form>
            </div>

            <div className="auth-footer">
              <p>
                Already have access?{" "}
                <Link to="/login" className="btn-tertiary !p-0 font-medium text-theme-text">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
