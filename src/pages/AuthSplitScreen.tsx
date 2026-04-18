import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { mapFirebaseAuthError } from "../auth/mapFirebaseAuthError";
import { AuthTestimonialMarquees } from "../components/AuthTestimonialMarquees";
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
  const reduceMotion = useReducedMotion();

  const ready = status === "ready";
  const isSignup = mode === "signup";
  const envOk = isFirebaseConfigured();

  if (ready && user) {
    return <Navigate to="/app" replace />;
  }

  const panelEase = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="auth-split bg-theme-bg text-theme-text">
      <motion.div
        className="auth-split__visual media-border-container relative h-full min-h-0 min-w-0 bg-theme-media-backdrop"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.38,
          ease: panelEase,
        }}
      >
        <img
          src="/auth-hero.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          width={1536}
          height={1024}
          decoding="async"
          fetchPriority="high"
        />
        <AuthTestimonialMarquees />
      </motion.div>

      <motion.div
        className="auth-split__panel bg-theme-bg"
        initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.34,
          delay: reduceMotion ? 0 : 0.08,
          ease: panelEase,
        }}
      >
        <div className="container flex w-full max-w-prose flex-col">
          <Link
            to="/"
            className="relative left-[-2px] top-[0.2rem] mb-v2.5 inline-flex items-center text-theme-text no-underline"
            aria-label="Homepage"
          >
            <KlickLogo />
          </Link>

          <h1 className="type-md-lg text-balance mb-v1">
            {isSignup ? "Create account" : "Log in"}
          </h1>

          {!envOk ? (
            <p className="type-sm mb-v1 text-theme-text-ter">
              Add{" "}
              <code className="type-product-sm rounded border border-theme-border-02 bg-theme-card-hex px-1 py-px">
                VITE_FIREBASE_*
              </code>{" "}
              to{" "}
              <code className="type-product-sm rounded border border-theme-border-02 bg-theme-card-hex px-1 py-px">
                .env.local
              </code>
            </p>
          ) : null}

          {error ? (
            <div className="auth-split__error mb-v1" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            className="btn btn--ghost w-full justify-center"
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
            <GoogleMark size={20} />
            <span>Continue with Google</span>
          </button>

          <div className="auth-split__rule py-v3/12" aria-hidden>
            <span>or</span>
          </div>

          <form
            className="flex min-h-0 flex-col gap-g1"
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
                <span className="type-sm text-theme-text-sec">Workspace</span>
                <input
                  className="app-input w-full"
                  value={workspace}
                  onChange={(ev) => setWorkspace(ev.target.value)}
                  required
                  autoComplete="organization"
                  disabled={!configured || !envOk}
                />
              </label>
            ) : null}

            <label className="auth-split__field">
              <span className="type-sm text-theme-text-sec">Email</span>
              <input
                className="app-input w-full"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                type="email"
                required
                autoComplete="email"
                disabled={!configured || !envOk}
              />
            </label>

            <label className="auth-split__field">
              <span className="type-sm text-theme-text-sec">Password</span>
              <input
                className="app-input w-full"
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
              className="btn mt-v8/12 w-full justify-center"
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

          <p className="type-sm mt-v1 text-theme-text-sec">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link to="/login" state={loc.state} className="btn-tertiary">
                  Log in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link to="/signup" state={loc.state} className="btn-tertiary">
                  Create account
                </Link>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
