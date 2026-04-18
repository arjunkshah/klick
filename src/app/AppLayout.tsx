import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  CheckSquare,
  FileText,
  FolderKanban,
  Inbox,
  Kanban,
  LayoutDashboard,
  MessageSquare,
  PlayCircle,
  Plug,
  Settings,
  Users,
} from "lucide-react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getSession } from "../auth/session";
import { KlickLogo } from "../components/KlickLogo";
import { useKlickStore } from "../data/store";
import { isFirebaseConfigured } from "../lib/firebase";
import { ThemeAppearanceToggle } from "../components/ThemeAppearanceToggle";

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
  Icon: LucideIcon;
};

const primary: NavItem[] = [
  { to: "/app", label: "Today", end: true, Icon: LayoutDashboard },
  { to: "/app/inbox", label: "Inbox", Icon: Inbox },
  { to: "/app/threads", label: "Threads", Icon: MessageSquare },
];

const work: NavItem[] = [
  { to: "/app/issues", label: "Issues", Icon: Kanban },
  { to: "/app/tasks", label: "Tasks", Icon: CheckSquare },
  { to: "/app/projects", label: "Projects", Icon: FolderKanban },
];

const context: NavItem[] = [
  { to: "/app/docs", label: "Docs", Icon: FileText },
  { to: "/app/people", label: "People", Icon: Users },
];

const automate: NavItem[] = [
  { to: "/app/dex", label: "Dex", Icon: Bot },
  { to: "/app/playbooks", label: "Playbooks", Icon: BookOpen },
  { to: "/app/runs", label: "Runs", Icon: PlayCircle },
];

const workspaceNav: NavItem[] = [
  { to: "/app/integrations", label: "Integrations", Icon: Plug },
  { to: "/app/settings", label: "Settings", Icon: Settings },
];

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "app-rail__link app-rail__link--active" : "app-rail__link";
}

const ONBOARDING_ALLOWED = new Set([
  "/app/onboarding",
  "/app/integrations",
  "/app/dex",
  "/app/settings",
]);

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const workspace = useKlickStore((s) => s.workspace);
  const workspaceLoadState = useKlickStore((s) => s.workspaceLoadState);
  const workspaceLoadError = useKlickStore((s) => s.workspaceLoadError);
  const inboxUnread = useKlickStore((s) => s.inbox.filter((i) => !i.read).length);
  const firebaseOk = isFirebaseConfigured();
  const { user, signOutUser } = useAuth();
  const session = getSession();
  const accountEmail = user?.email ?? session?.email;

  const iconProps = { size: 22, strokeWidth: 1.65, className: "shrink-0" };

  const renderNav = (items: NavItem[]) =>
    items.map(({ to, label, end, Icon }) => (
      <NavLink key={to} to={to} end={end} className={linkClass}>
        <Icon {...iconProps} aria-hidden />
        <span className="app-rail__link-text truncate">{label}</span>
        {to === "/app/inbox" && inboxUnread > 0 ? (
          <span className="app-rail__badge">{inboxUnread}</span>
        ) : null}
      </NavLink>
    ));

  const section = (title: string, items: NavItem[]) => (
    <div key={title} className="app-rail__section">
      <h2 className="app-rail__section-label">{title}</h2>
      {renderNav(items)}
    </div>
  );

  if (
    firebaseOk &&
    workspaceLoadState === "ready" &&
    workspace.onboardingDone === false &&
    !ONBOARDING_ALLOWED.has(location.pathname)
  ) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <div className="app-shell">
      <aside className="app-rail" id="app-rail" aria-label="Workspace">
        <div className="app-rail__head">
          <NavLink
            to="/app"
            className="app-rail__brand text-theme-text no-underline transition-opacity duration-[var(--duration)] hover:opacity-85"
            aria-label="Klick"
          >
            <KlickLogo className="text-[1.125rem] font-semibold tracking-[-0.03em] sm:text-[1.25rem]" />
          </NavLink>
        </div>

        <div className="app-rail__meta">
          <div className="app-rail__meta-line">{workspace.name}</div>
          <div className="app-rail__meta-sub">{accountEmail ?? "Signed in"}</div>
        </div>

        <nav className="app-rail__nav" aria-label="Primary">
          {section("Pulse", primary)}
          {section("Work", work)}
          {section("Context", context)}
          {section("Agents", automate)}
          {section("Workspace", workspaceNav)}
        </nav>

        <div className="app-rail__footer">
          <button
            type="button"
            className="app-rail__signout"
            onClick={() => {
              void signOutUser().then(() => navigate("/"));
            }}
          >
            Sign out
          </button>
          <ThemeAppearanceToggle />
        </div>
      </aside>

      <main className="app-canvas">
        <div className="app-canvas__stack">
          {firebaseOk && workspaceLoadState === "loading" ? (
            <div className="app-sync-banner app-sync-banner--loading" role="status" aria-live="polite">
              Syncing workspace from Firebase…
            </div>
          ) : null}
          {firebaseOk && workspaceLoadState === "error" ? (
            <div className="app-sync-banner app-sync-banner--error" role="alert">
              Workspace sync failed{workspaceLoadError ? `: ${workspaceLoadError}` : ""}. Enable Firestore and
              deploy rules (see repo <code className="app-sync-banner__code">firestore.rules</code>).
            </div>
          ) : null}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
