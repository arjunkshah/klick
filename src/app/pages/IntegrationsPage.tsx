import { useKlickStore } from "../../data/store";

export function IntegrationsPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const setSlackConnected = useKlickStore((s) => s.setSlackConnected);

  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <h1 className="type-md mb-v1">Integrations</h1>
      <p className="type-base text-theme-text-sec mb-v2">
        v1 simulates connections locally. Real OAuth ships in a later release.
      </p>
      <div className="card !p-g1.5">
        <div className="flex flex-wrap items-center justify-between gap-g1">
          <div>
            <div className="type-base font-medium">Slack</div>
            <p className="type-sm text-theme-text-sec">
              Mirror highlights and approvals to a workspace channel.
            </p>
          </div>
          <button
            type="button"
            className={workspace.slackConnected ? "btn btn--secondary btn--sm" : "btn btn--sm"}
            onClick={() => setSlackConnected(!workspace.slackConnected)}
          >
            {workspace.slackConnected ? "Disconnect" : "Connect"}
          </button>
        </div>
        {workspace.slackConnected ? (
          <p className="type-sm mt-2 text-theme-accent">Slack connected (demo).</p>
        ) : null}
      </div>
      <div className="card !p-g1.5 mt-g1 opacity-60">
        <div className="type-base font-medium">GitHub</div>
        <p className="type-sm text-theme-text-sec">Coming soon.</p>
      </div>
      <div className="card !p-g1.5 mt-g1 opacity-60">
        <div className="type-base font-medium">Notion</div>
        <p className="type-sm text-theme-text-sec">Coming soon.</p>
      </div>
    </div>
  );
}
