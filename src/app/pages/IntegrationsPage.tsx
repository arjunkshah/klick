import type { LucideIcon } from "lucide-react";
import { Calendar, GitBranch, MessageSquare, Plug } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";

type CardProps = {
  icon: LucideIcon;
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

function IntegrationCard({ icon: Icon, name, description, connected, onToggle, disabled, footer }: CardProps) {
  return (
    <article className={`integration-card${connected ? " integration-card--on" : ""}`}>
      <div className="integration-card__top">
        <span className="integration-card__glyph" aria-hidden>
          <Icon size={22} strokeWidth={1.65} />
        </span>
        <div className="integration-card__head">
          <h2 className="integration-card__title">{name}</h2>
          <p className="integration-card__desc">{description}</p>
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
          <p className="today-page__workspace">{workspace.name}</p>
          <div className="today-page__title-row">
            <h1 className="today-page__title">Integrations</h1>
            <Link to="/app/settings" className="today-link">
              Settings
            </Link>
          </div>
          <p className="hub-lede">
            Connect tools your team already uses. Toggles persist with your workspace in{" "}
            <strong>Firestore</strong>—wire real OAuth when you are ready; today they drive UI state and Dex context.
          </p>
        </header>

        <div className="integrations-grid">
          <IntegrationCard
            icon={MessageSquare}
            name="Slack"
            description="Mirror highlights to channels and show connection status across the app."
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
            name="Google Calendar"
            description="Surface focus time and meetings in Today (context for Dex and planning)."
            connected={Boolean(workspace.googleCalendarConnected)}
            onToggle={(next) => patchWorkspace({ googleCalendarConnected: next })}
          />
          <IntegrationCard
            icon={GitBranch}
            name="GitHub"
            description="Link PRs and automation signals to issues and playbooks."
            connected={Boolean(workspace.githubConnected)}
            onToggle={(next) => patchWorkspace({ githubConnected: next })}
          />
          <article className="integration-card integration-card--muted">
            <div className="integration-card__top">
              <span className="integration-card__glyph" aria-hidden>
                <Plug size={22} strokeWidth={1.65} />
              </span>
              <div className="integration-card__head">
                <h2 className="integration-card__title">Custom API</h2>
                <p className="integration-card__desc">
                  Use your Dex and workspace JSON from the client; add server webhooks when you need outbound events.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
