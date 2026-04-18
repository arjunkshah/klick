import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { mapFirebaseAuthError } from "../auth/mapFirebaseAuthError";
import { isFirebaseConfigured } from "../lib/firebase";
import { GoogleMark } from "../components/GoogleMark";
import { KlickLogo } from "../components/KlickLogo";

export function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/app";
  const { status, user, configured, signInWithGoogle, signInWithEmailPassword } = useAuth();

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
          <Link className="btn btn--secondary btn--sm no-underline" to="/signup">
            Get started
          </Link>
        </div>
      </header>

      <main className="auth-page__main">
        <div className="auth-page__panel">
          <div className="card card--large">
            <p className="auth-eyebrow">Account</p>
            <h1 className="auth-title type-md text-balance">Sign in</h1>
            <p className="auth-lede text-pretty">
              Sign in with Google or email. Workspace data stays in this browser until you add sync.
            </p>

            {!envOk ? (
              <div className="auth-callout">
                Add <code>VITE_FIREBASE_*</code> to <code>.env.local</code> — see{" "}
                <code>.env.example</code>.
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
                    await signInWithGoogle();
                    nav(from, { replace: true });
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
                    await signInWithEmailPassword(email, password);
                    nav(from, { replace: true });
                  } catch (err) {
                    setError(mapFirebaseAuthError(err));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="login-email">
                    Email
                  </label>
                  <input
                    id="login-email"
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
                  <label className="auth-field-label" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    className="auth-field-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    autoComplete="current-password"
                    minLength={6}
                    disabled={!configured || !envOk}
                  />
                </div>
                <button
                  type="submit"
                  className="btn mt-v8/12 w-full justify-center disabled:opacity-50"
                  disabled={!configured || busy || !envOk}
                >
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </div>

            <div className="auth-footer">
              <p>
                New here?{" "}
                <Link to="/signup" className="btn-tertiary !p-0 font-medium text-theme-text">
                  Create workspace →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
