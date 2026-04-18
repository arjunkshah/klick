import { Link } from "react-router-dom";
import { useKlickStore } from "../../../data/store";
import { ThemeAppearanceToggle } from "../../../components/ThemeAppearanceToggle";

export function SettingsHomePage() {
  const profile = useKlickStore((s) => s.profile);
  const setProfile = useKlickStore((s) => s.setProfile);
  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <h1 className="type-md mb-v1">Settings</h1>
      <p className="type-sm text-theme-text-sec mb-v2">Profile and preferences for this browser.</p>

      <div className="card !p-g1.5 mb-g1">
        <h2 className="type-base mb-v2">Profile</h2>
        <label className="type-sm flex flex-col gap-1 mb-2">
          Display name
          <input
            className="type-base rounded-xs border border-theme-border-02 bg-theme-bg px-3 py-2"
            value={profile.displayName}
            onChange={(e) =>
              setProfile({ ...profile, displayName: e.target.value })
            }
          />
        </label>
        <label className="type-sm flex flex-col gap-1">
          Email
          <input
            className="type-base rounded-xs border border-theme-border-02 bg-theme-bg px-3 py-2"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            type="email"
          />
        </label>
      </div>

      <div className="card !p-g1.5 mb-g1">
        <h2 className="type-base mb-v1">Appearance</h2>
        <p className="type-sm mb-v2 text-theme-text-sec">
          Theme applies to this browser. Use the control to switch between light and dark.
        </p>
        <ThemeAppearanceToggle />
      </div>

      <ul className="type-base space-y-2">
        <li>
          <Link to="/app/settings/workspace" className="text-theme-accent no-underline hover:underline">
            Workspace
          </Link>
        </li>
        <li>
          <Link to="/app/settings/team" className="text-theme-accent no-underline hover:underline">
            Team & roles
          </Link>
        </li>
        <li>
          <Link to="/app/settings/security" className="text-theme-accent no-underline hover:underline">
            Security
          </Link>
        </li>
      </ul>
    </div>
  );
}
