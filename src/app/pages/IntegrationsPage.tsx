import type { LucideIcon } from "lucide-react";
import { Calendar, GitBranch, MessageSquare, Plug } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";

type CardProps = {
  icon: LucideIcon;
  category: string;
  name: string;
  description: string;
  connected: boolean;
  onToggle: (next: boolean) => void;
  disabled?: boolean;
  footer?: ReactNode;
};

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
      <span className="integration-field__label">Workspace label</span>
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

function IntegrationCard({
  icon: Icon,
  category,
  name,
  description,
  connected,
  onToggle,
  disabled,
  footer,
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
              {connected ? "Connected — syncing to workspace" : "Not connected — toggle to enable"}
            </span>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={connected}
          disabled={disabled}
          className={`integration-toggle${connected ? " integration-toggle--on" : ""}`}
          onClick={() => onToggle(!connected)}
        >
          <span className="integration-toggle__knob" />
        </button>
      </div>
      {footer ? <div className="integration-card__footer">{footer}</div> : null}
    </article>
  );
}

export function IntegrationsPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const patchWorkspace = useKlickStore((s) => s.patchWorkspace);

  const activeCount =
    Number(workspace.slackConnected) +
    Number(Boolean(workspace.googleCalendarConnected)) +
    Number(Boolean(workspace.githubConnected));

  const commitSlackLabel = useCallback(
    (trimmed: string) => {
      patchWorkspace({ slackWorkspace: trimmed || undefined });
    },
    [patchWorkspace],
  );

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
                  Connect the tools your team already lives in. State persists to <strong>Firestore</strong> and feeds{" "}
                  <strong>Dex</strong> context—swap toggles for real OAuth when you wire the backend.
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
                <span className="hub-stats__label">Active</span>
              </li>
              <li className="hub-stats__item">
                <span className="hub-stats__value">3</span>
                <span className="hub-stats__label">Core services</span>
              </li>
            </ul>
          </div>
        </header>

        <h2 className="hub-section-heading">Core services</h2>
        <div className="integrations-grid">
          <IntegrationCard
            icon={MessageSquare}
            category="Messaging"
            name="Slack"
            description="Mirror highlights to channels, surface connection status in Today, and keep Dex aware of your workspace."
            connected={workspace.slackConnected}
            onToggle={(next) => patchWorkspace({ slackConnected: next })}
            footer={
              workspace.slackConnected ? (
                <SlackWorkspaceLabelField
                  key={workspace.slackWorkspace ?? "__none__"}
                  initialValue={workspace.slackWorkspace ?? ""}
                  onCommit={commitSlackLabel}
                />
              ) : null
            }
          />
          <IntegrationCard
            icon={Calendar}
            category="Calendar"
            name="Google Calendar"
            description="Pull focus time and meetings into Today so planning and Dex answers match how your day actually looks."
            connected={Boolean(workspace.googleCalendarConnected)}
            onToggle={(next) => patchWorkspace({ googleCalendarConnected: next })}
          />
          <IntegrationCard
            icon={GitBranch}
            category="Code"
            name="GitHub"
            description="Tie PRs, checks, and automation signals back to issues and playbook runs for a single narrative."
            connected={Boolean(workspace.githubConnected)}
            onToggle={(next) => patchWorkspace({ githubConnected: next })}
          />
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
                  Ship workspace JSON to your own services from the client today; add authenticated webhooks when you need
                  outbound events or server-side fan-out.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
