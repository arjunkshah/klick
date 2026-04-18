import type { LucideIcon } from "lucide-react";
import { Calendar, GitBranch, Loader2, MessageSquare, Plug } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useKlickStore } from "../../data/store";
import { fetchGitHubUser } from "../../lib/githubApi";
import { connectGoogleCalendar } from "../../lib/googleCalendarConnect";
import { disconnectIntegration } from "../../lib/integrationDisconnect";
import { startGitHubOAuth, startSlackOAuth } from "../../lib/oauthIntegrations";
import { slackAuthTest } from "../../lib/slackApi";

function SlackWorkspaceLabelField({
  initialValue,
  onCommit,
}: {
  initialValue: string;
  onCommit: (trimmed: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <label className="integration-field">
      <span className="integration-field__label">Workspace label (optional)</span>
      <input
        type="text"
        className="hub-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onCommit(value.trim())}
        placeholder="e.g. acme.slack.com"
      />
    </label>
  );
}

type CardProps = {
  icon: LucideIcon;
  category: string;
  name: string;
  description: string;
  connected: boolean;
  statusDetail?: ReactNode;
  busy?: boolean;
  connectLabel: string;
  onConnect: () => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
  disabledConnect?: boolean;
  disabledReason?: string;
  footer?: ReactNode;
  children?: ReactNode;
};

function SlackLiveLabel({ token }: { token: string }) {
  const [detail, setDetail] = useState("Verifying…");
  useEffect(() => {
    let cancel = false;
    slackAuthTest(token)
      .then((r) => {
        if (!cancel) setDetail(r.team ? `Live · ${r.team}` : "Live");
      })
      .catch(() => {
        if (!cancel) setDetail("Token invalid — reconnect");
      });
    return () => {
      cancel = true;
    };
  }, [token]);
  return <>{detail}</>;
}

function GitHubLiveLabel({ token }: { token: string }) {
  const [detail, setDetail] = useState("Verifying…");
  useEffect(() => {
    let cancel = false;
    fetchGitHubUser(token)
      .then((r) => {
        if (!cancel) setDetail(r.login ? `@${r.login}` : "Live");
      })
      .catch(() => {
        if (!cancel) setDetail("Token invalid — reconnect");
      });
    return () => {
      cancel = true;
    };
  }, [token]);
  return <>{detail}</>;
}

function IntegrationServiceCard({
  icon: Icon,
  category,
  name,
  description,
  connected,
  statusDetail,
  busy,
  connectLabel,
  onConnect,
  onDisconnect,
  disabledConnect,
  disabledReason,
  footer,
  children,
}: CardProps) {
  return (
    <article className={`integration-card${connected ? " integration-card--on" : ""}`}>
      <div className="integration-card__top">
        <span className="integration-card__glyph" aria-hidden>
          <Icon size={22} strokeWidth={1.65} />
        </span>
        <div className="integration-card__head">
          <span className="integration-card__tag">{category}</span>
          <h2 className="integration-card__title">{name}</h2>
          <p className="integration-card__desc">{description}</p>
          <div className="integration-card__status-row">
            <span className="integration-card__status-dot" aria-hidden />
            <span
              className={
                connected ? "integration-card__status-label--on" : "integration-card__status-label--off"
              }
            >
              {statusDetail != null && statusDetail !== ""
                ? statusDetail
                : connected
                  ? "Connected"
                  : disabledReason || "Not connected"}
            </span>
          </div>
          {children}
          <div className="integration-card__actions">
            {connected ? (
              <button
                type="button"
                className="work-btn work-btn--danger"
                disabled={busy}
                onClick={() => void onDisconnect()}
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                className="work-btn work-btn--primary"
                disabled={busy || disabledConnect}
                onClick={() => void onConnect()}
              >
                {busy ? (
                  <>
                    <Loader2 className="integration-btn-spinner" size={16} aria-hidden />
                    Working…
                  </>
                ) : (
                  connectLabel
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      {footer ? <div className="integration-card__footer">{footer}</div> : null}
    </article>
  );
}

export function IntegrationsPage() {
  const { user } = useAuth();
  const workspace = useKlickStore((s) => s.workspace);
  const patchWorkspace = useKlickStore((s) => s.patchWorkspace);
  const privateIntegrations = useKlickStore((s) => s.privateIntegrations);

  const [params, setParams] = useSearchParams();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [actionBanner, setActionBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState<"slack" | "github" | "google" | null>(null);

  const slackTok = privateIntegrations?.slack?.accessToken;
  const githubTok = privateIntegrations?.github?.accessToken;
  const googleTok = privateIntegrations?.googleCalendar?.accessToken;

  const paramBanner = useMemo(() => {
    const slackErr = params.get("slack_error");
    const githubErr = params.get("github_error");
    if (params.get("slack") === "connected") return { type: "ok" as const, text: "Slack connected successfully." };
    if (params.get("github") === "connected") return { type: "ok" as const, text: "GitHub connected successfully." };
    if (slackErr) return { type: "err" as const, text: `Slack: ${decodeURIComponent(slackErr)}` };
    if (githubErr) return { type: "err" as const, text: `GitHub: ${decodeURIComponent(githubErr)}` };
    return null;
  }, [params]);

  const banner =
    actionBanner ?? (!bannerDismissed && paramBanner ? paramBanner : null);

  const getToken = useCallback(async () => {
    if (!user) throw new Error("Sign in required.");
    return user.getIdToken();
  }, [user]);

  const commitSlackLabel = useCallback(
    (trimmed: string) => {
      patchWorkspace({ slackWorkspace: trimmed || undefined });
    },
    [patchWorkspace],
  );

  const activeCount =
    Number(Boolean(slackTok)) +
    Number(Boolean(githubTok)) +
    Number(Boolean(googleTok && workspace.googleCalendarConnected));

  const oauthConfigured =
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    window.location.protocol === "https:";

  return (
    <div className="app-page hub-page">
      <div className="today-page work-page work-page--wide">
        <header className="today-page__header">
          <div className="hub-hero">
            <p className="today-page__workspace">{workspace.name}</p>
            <div className="hub-hero__top">
              <div className="hub-hero__title-wrap">
                <h1 className="today-page__title">Integrations</h1>
                <p className="hub-lede">
                  Connect real services with OAuth. Slack and GitHub use secure server callbacks (Vercel + Firebase
                  Admin). Google Calendar links through your Firebase account with read-only calendar access.
                </p>
              </div>
              <nav className="hub-pill-nav" aria-label="Workspace">
                <Link to="/app/settings" className="hub-pill-nav__item">
                  Settings
                </Link>
                <span className="hub-pill-nav__item hub-pill-nav__item--current">Integrations</span>
                <Link to="/app/playbooks" className="hub-pill-nav__item">
                  Playbooks
                </Link>
              </nav>
            </div>
            <ul className="hub-stats" aria-label="Integration overview">
              <li className="hub-stats__item">
                <span className="hub-stats__value">{activeCount}</span>
                <span className="hub-stats__label">Connected</span>
              </li>
              <li className="hub-stats__item">
                <span className="hub-stats__value">3</span>
                <span className="hub-stats__label">Services</span>
              </li>
            </ul>
          </div>
        </header>

        {banner ? (
          <div
            className={`integration-flash${banner.type === "err" ? " integration-flash--err" : ""}`}
            role="status"
          >
            {banner.text}
            <button
              type="button"
              className="integration-flash__dismiss"
              onClick={() => {
                setBannerDismissed(true);
                setActionBanner(null);
                const next = new URLSearchParams(params);
                next.delete("slack");
                next.delete("slack_error");
                next.delete("github");
                next.delete("github_error");
                setParams(next, { replace: true });
              }}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <div className="integration-setup-hint today-panel">
          <p className="integration-setup-hint__title">Deploy checklist</p>
          <ul className="integration-setup-hint__list">
            <li>
              Set <code className="integration-setup-hint__code">FIREBASE_SERVICE_ACCOUNT_JSON</code>,{" "}
              <code className="integration-setup-hint__code">INTEGRATION_OAUTH_SECRET</code>,{" "}
              <code className="integration-setup-hint__code">SLACK_CLIENT_ID</code> /{" "}
              <code className="integration-setup-hint__code">SLACK_CLIENT_SECRET</code>,{" "}
              <code className="integration-setup-hint__code">GITHUB_CLIENT_ID</code> /{" "}
              <code className="integration-setup-hint__code">GITHUB_CLIENT_SECRET</code>, and optional{" "}
              <code className="integration-setup-hint__code">APP_ORIGIN</code> on Vercel.
            </li>
            <li>
              Slack redirect URL:{" "}
              <code className="integration-setup-hint__code">
                {typeof window !== "undefined" ? window.location.origin : ""}/api/integrations/slack/callback
              </code>
            </li>
            <li>
              GitHub callback URL:{" "}
              <code className="integration-setup-hint__code">
                {typeof window !== "undefined" ? window.location.origin : ""}/api/integrations/github/callback
              </code>
            </li>
            <li>Local dev: run <code className="integration-setup-hint__code">vercel dev</code> so OAuth routes resolve.</li>
          </ul>
        </div>

        <h2 className="hub-section-heading">Core services</h2>
        <div className="integrations-grid">
          <IntegrationServiceCard
            icon={MessageSquare}
            category="Messaging"
            name="Slack"
            description="Install the Klick app to your workspace. We store the bot token in your private Firestore doc and verify it with auth.test."
            connected={Boolean(slackTok)}
            statusDetail={slackTok ? <SlackLiveLabel token={slackTok} /> : undefined}
            busy={busy === "slack"}
            connectLabel="Connect Slack"
            disabledConnect={!user}
            disabledReason={!user ? "Sign in required" : undefined}
            onConnect={async () => {
              if (!user) return;
              setBusy("slack");
              try {
                await startSlackOAuth(getToken);
              } catch (e) {
                setActionBanner({
                  type: "err",
                  text: e instanceof Error ? e.message : "Could not start Slack OAuth",
                });
                setBusy(null);
              }
            }}
            onDisconnect={async () => {
              if (!user) return;
              setBusy("slack");
              try {
                await disconnectIntegration(user, "slack");
              } finally {
                setBusy(null);
              }
            }}
            footer={
              slackTok ? (
                <SlackWorkspaceLabelField
                  key={workspace.slackWorkspace ?? "__none__"}
                  initialValue={workspace.slackWorkspace ?? privateIntegrations?.slack?.teamName ?? ""}
                  onCommit={commitSlackLabel}
                />
              ) : null
            }
          />

          <IntegrationServiceCard
            icon={Calendar}
            category="Calendar"
            name="Google Calendar"
            description="Read-only access to upcoming events on your primary calendar. Uses Google link/re-auth through Firebase — no extra server env."
            connected={Boolean(googleTok && workspace.googleCalendarConnected)}
            statusDetail={
              googleTok && !workspace.googleCalendarConnected
                ? "Session expired — reconnect"
                : googleTok
                  ? "Read-only · primary calendar"
                  : undefined
            }
            busy={busy === "google"}
            connectLabel="Connect Google Calendar"
            disabledConnect={!user}
            disabledReason={!user ? "Sign in required" : undefined}
            onConnect={async () => {
              if (!user) return;
              setBusy("google");
              try {
                await connectGoogleCalendar(user);
                setActionBanner({ type: "ok", text: "Google Calendar connected." });
              } catch (e) {
                setActionBanner({
                  type: "err",
                  text: e instanceof Error ? e.message : "Calendar connect failed",
                });
              } finally {
                setBusy(null);
              }
            }}
            onDisconnect={async () => {
              if (!user) return;
              setBusy("google");
              try {
                await disconnectIntegration(user, "googleCalendar");
              } finally {
                setBusy(null);
              }
            }}
          />

          <IntegrationServiceCard
            icon={GitBranch}
            category="Code"
            name="GitHub"
            description="OAuth to your GitHub account (read user + org metadata). Token is stored only in your Firestore private doc."
            connected={Boolean(githubTok)}
            statusDetail={githubTok ? <GitHubLiveLabel token={githubTok} /> : undefined}
            busy={busy === "github"}
            connectLabel="Connect GitHub"
            disabledConnect={!user}
            disabledReason={!user ? "Sign in required" : undefined}
            onConnect={async () => {
              if (!user) return;
              setBusy("github");
              try {
                await startGitHubOAuth(getToken);
              } catch (e) {
                setActionBanner({
                  type: "err",
                  text: e instanceof Error ? e.message : "Could not start GitHub OAuth",
                });
                setBusy(null);
              }
            }}
            onDisconnect={async () => {
              if (!user) return;
              setBusy("github");
              try {
                await disconnectIntegration(user, "github");
              } finally {
                setBusy(null);
              }
            }}
          >
            {!oauthConfigured ? (
              <p className="integration-card__note">
                OAuth redirects require HTTPS (e.g. Vercel preview/production). Use{" "}
                <code className="integration-setup-hint__code">vercel dev</code> locally.
              </p>
            ) : null}
          </IntegrationServiceCard>
        </div>

        <h2 className="hub-section-heading">Developers</h2>
        <div className="integrations-grid">
          <article className="integration-card integration-card--muted">
            <div className="integration-card__top">
              <span className="integration-card__glyph" aria-hidden>
                <Plug size={22} strokeWidth={1.65} />
              </span>
              <div className="integration-card__head">
                <span className="integration-card__tag">Extensibility</span>
                <h2 className="integration-card__title">Custom API & webhooks</h2>
                <p className="integration-card__desc">
                  Dex already consumes workspace JSON. Add your own workers that read the same Firestore documents or
                  subscribe to outbound webhooks from a future server module.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
