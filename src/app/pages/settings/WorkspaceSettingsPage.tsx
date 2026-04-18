import { Link } from "react-router-dom";
import { useKlickStore } from "../../../data/store";

export function WorkspaceSettingsPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const setWorkspaceName = useKlickStore((s) => s.setWorkspaceName);
  const resetDemo = useKlickStore((s) => s.resetDemo);

  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <Link to="/app/settings" className="type-sm text-theme-text-sec hover:text-theme-text">
        ← Settings
      </Link>
      <h1 className="type-md mt-v1 mb-v2">Workspace</h1>
      <label className="type-sm flex flex-col gap-1">
        Workspace name
        <input
          className="type-base max-w-md rounded-xs border border-theme-border-02 bg-theme-bg px-3 py-2"
          value={workspace.name}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
      </label>
      <p className="type-sm text-theme-text-sec mt-v2">
        Billing and plans are not wired in v1.
      </p>
      <div className="mt-v3 border-t border-theme-border-02 pt-v2">
        <h2 className="type-base mb-v1">Danger zone</h2>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => {
            if (confirm("Reset all demo data to defaults?")) resetDemo();
          }}
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}
