import { updateProfile, type User } from "firebase/auth";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeAppearanceToggle } from "../../components/ThemeAppearanceToggle";
import { useAuth } from "../../auth/useAuth";
import { getSession, setSession } from "../../auth/session";
import { getFirebaseAuth, isFirebaseConfigured } from "../../lib/firebase";
import { useKlickStore } from "../../data/store";

type ProfileShape = { displayName: string; email: string };

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type EditableProps = {
  workspaceName: string;
  profile: ProfileShape;
  user: User | null;
  setWorkspaceName: (name: string) => void;
  setProfile: (p: ProfileShape) => void;
};

function SettingsEditableFields({
  workspaceName,
  profile,
  user,
  setWorkspaceName,
  setProfile,
}: EditableProps) {
  const [wsName, setWsName] = useState(workspaceName);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [wsSaved, setWsSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const saveWorkspace = useCallback(() => {
    const next = wsName.trim() || "My workspace";
    setWorkspaceName(next);
    const sess = getSession();
    if (sess) setSession({ ...sess, workspaceName: next });
    setWsSaved(true);
    window.setTimeout(() => setWsSaved(false), 2000);
  }, [wsName, setWorkspaceName]);

  const saveProfile = useCallback(async () => {
    const next = displayName.trim() || profile.email.split("@")[0] || "You";
    setProfileErr(null);
    const auth = getFirebaseAuth();
    if (auth && user) {
      try {
        await updateProfile(user, { displayName: next });
      } catch (e) {
        setProfileErr(e instanceof Error ? e.message : "Could not update profile");
        return;
      }
    }
    setProfile({ displayName: next, email: profile.email });
    const sess = getSession();
    if (sess) setSession({ ...sess, displayName: next });
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2000);
  }, [displayName, profile.email, user, setProfile]);

  return (
    <>
      <section className="settings-card" aria-labelledby="settings-ws-heading">
        <h2 id="settings-ws-heading" className="settings-card__title">
          Workspace
        </h2>
        <p className="settings-card__hint">Shown in the sidebar, Today, and Dex context.</p>
        <label className="hub-field-label" htmlFor="settings-ws-name">
          Display name
        </label>
        <div className="settings-inline">
          <input
            id="settings-ws-name"
            type="text"
            className="hub-input"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
          />
          <button type="button" className="work-btn work-btn--primary" onClick={saveWorkspace}>
            Save
          </button>
        </div>
        {wsSaved ? (
          <p className="settings-toast" role="status">
            Workspace saved.
          </p>
        ) : null}
      </section>

      <section className="settings-card" aria-labelledby="settings-profile-heading">
        <h2 id="settings-profile-heading" className="settings-card__title">
          Profile
        </h2>
        <p className="settings-card__hint">
          {isFirebaseConfigured() && user
            ? "Updates your Firebase display name when signed in."
            : "Updates the local profile label for this session."}
        </p>
        <label className="hub-field-label" htmlFor="settings-display">
          Display name
        </label>
        <div className="settings-inline">
          <input
            id="settings-display"
            type="text"
            className="hub-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <button type="button" className="work-btn work-btn--primary" onClick={() => void saveProfile()}>
            Save
          </button>
        </div>
        <label className="hub-field-label" htmlFor="settings-email">
          Email
        </label>
        <input id="settings-email" type="email" className="hub-input hub-input--readonly" readOnly value={profile.email} />
        {profileErr ? (
          <p className="settings-warn" role="alert">
            {profileErr}
          </p>
        ) : null}
        {profileSaved ? (
          <p className="settings-toast" role="status">
            Profile saved.
          </p>
        ) : null}
      </section>
    </>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const workspace = useKlickStore((s) => s.workspace);
  const profile = useKlickStore((s) => s.profile);
  const setWorkspaceName = useKlickStore((s) => s.setWorkspaceName);
  const setProfile = useKlickStore((s) => s.setProfile);

  const syncLabel = isFirebaseConfigured() && user ? "Cloud" : "Local";
  const integrationTotal =
    Number(workspace.slackConnected) +
    Number(Boolean(workspace.googleCalendarConnected)) +
    Number(Boolean(workspace.githubConnected));

  return (
    <div className="app-page hub-page">
      <div className="today-page work-page work-page--wide">
        <header className="today-page__header">
          <div className="hub-hero">
            <p className="today-page__workspace">{workspace.name}</p>
            <div className="hub-hero__top">
              <div className="hub-hero__title-wrap">
                <h1 className="today-page__title">Settings</h1>
                <p className="hub-lede">
                  Tune how your workspace shows up across the app. Name and profile flow through{" "}
                  <strong>Firebase</strong> with the rest of your Klick data.
                </p>
              </div>
              <nav className="hub-pill-nav" aria-label="Workspace">
                <span className="hub-pill-nav__item hub-pill-nav__item--current">Settings</span>
                <Link to="/app/integrations" className="hub-pill-nav__item">
                  Integrations
                </Link>
                <Link to="/app/playbooks" className="hub-pill-nav__item">
                  Playbooks
                </Link>
              </nav>
            </div>
            <ul className="hub-stats" aria-label="Account overview">
              <li className="hub-stats__item">
                <span className="hub-stats__value">{syncLabel}</span>
                <span className="hub-stats__label">Sync mode</span>
              </li>
              <li className="hub-stats__item">
                <span className="hub-stats__value">{integrationTotal}</span>
                <span className="hub-stats__label">Integrations on</span>
              </li>
            </ul>
          </div>
        </header>

        <div className="settings-layout">
          <div className="settings-layout__main">
            <SettingsEditableFields
              key={`${workspace.name}\0${profile.displayName}\0${profile.email}`}
              workspaceName={workspace.name}
              profile={profile}
              user={user}
              setWorkspaceName={setWorkspaceName}
              setProfile={setProfile}
            />

            <section className="settings-card" aria-labelledby="settings-theme-heading">
              <h2 id="settings-theme-heading" className="settings-card__title">
                Appearance
              </h2>
              <p className="settings-card__hint">Matches the control in the workspace rail. Changes apply instantly.</p>
              <div className="settings-theme-row">
                <span className="settings-theme-label">Theme</span>
                <ThemeAppearanceToggle />
              </div>
            </section>

            <section className="settings-card settings-card--muted" aria-labelledby="settings-data-heading">
              <h2 id="settings-data-heading" className="settings-card__title">
                Data &amp; privacy
              </h2>
              <p className="settings-card__text">
                Issues, docs, Dex chats, playbooks, and runs live in Firestore under your account. Signing out clears local
                session state; cloud data stays until you remove it in the Firebase console.
              </p>
            </section>
          </div>

          <aside className="settings-layout__aside" aria-label="Account summary">
            <div className="settings-summary">
              <p className="settings-summary__label">Signed in as</p>
              <div className="settings-summary__profile">
                <span className="settings-summary__avatar" aria-hidden>
                  {initialsFromName(profile.displayName)}
                </span>
                <div>
                  <p className="settings-summary__name">{profile.displayName || "Member"}</p>
                  <p className="settings-summary__email">{profile.email || "—"}</p>
                </div>
              </div>
              <div className="settings-summary__ws">
                <strong>Active workspace</strong>
                {workspace.name}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
