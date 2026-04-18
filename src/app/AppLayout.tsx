import type { ComponentType } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getSession } from "../auth/session";
import { KlickLogo } from "../components/KlickLogo";
import { useKlickStore } from "../data/store";
import { ThemeAppearanceToggle } from "../components/ThemeAppearanceToggle";
import {
  IconChevronRail,
  IconDex,
  IconDocs,
  IconInbox,
  IconIntegrations,
  IconIssues,
  IconPeople,
  IconPlaybooks,
  IconProjects,
  IconRuns,
  IconSettings,
  IconTasks,
  IconThreads,
  IconToday,
} from "./components/NavIcons";
import { CommandPalette } from "./components/CommandPalette";
import { useCommandPalette } from "./components/useCommandPalette";
import { useSidebarCollapsed } from "./hooks/useSidebarCollapsed";

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
  Icon: ComponentType;
};

const primary: NavItem[] = [
  { to: "/app", label: "Today", end: true, Icon: IconToday },
  { to: "/app/inbox", label: "Inbox", Icon: IconInbox },
  { to: "/app/threads", label: "Threads", Icon: IconThreads },
];

const work: NavItem[] = [
  { to: "/app/issues", label: "Issues", Icon: IconIssues },
  { to: "/app/tasks", label: "Tasks", Icon: IconTasks },
  { to: "/app/projects", label: "Projects", Icon: IconProjects },
];

const context: NavItem[] = [
  { to: "/app/docs", label: "Docs", Icon: IconDocs },
  { to: "/app/people", label: "People", Icon: IconPeople },
];

const automate: NavItem[] = [
  { to: "/app/dex", label: "Dex", Icon: IconDex },
  { to: "/app/playbooks", label: "Playbooks", Icon: IconPlaybooks },
  { to: "/app/runs", label: "Runs", Icon: IconRuns },
];

const workspaceNav: NavItem[] = [
  { to: "/app/integrations", label: "Integrations", Icon: IconIntegrations },
  { to: "/app/settings", label: "Settings", Icon: IconSettings },
];

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "app-nav-link app-nav-link--active" : "app-nav-link";
}

export function AppLayout() {
  const navigate = useNavigate();
  const workspace = useKlickStore((s) => s.workspace);
  const inboxUnread = useKlickStore((s) => s.inbox.filter((i) => !i.read).length);
  const { user, signOutUser } = useAuth();
  const session = getSession();
  const accountEmail = user?.email ?? session?.email;
  const { open, setOpen } = useCommandPalette();
  const { collapsed, toggle } = useSidebarCollapsed();

  const renderNav = (items: NavItem[]) =>
    items.map(({ to, label, end, Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={linkClass}
        title={collapsed ? label : undefined}
      >
        <span className="app-nav-icon" aria-hidden>
          <Icon />
        </span>
        <span className="app-nav-label truncate">{label}</span>
        {to === "/app/inbox" && inboxUnread > 0 ? (
          <span className="app-inbox-badge type-product-sm shrink-0 rounded-full bg-theme-accent px-1.5 py-px text-white">
            {inboxUnread}
          </span>
        ) : null}
      </NavLink>
    ));

  const navBlock = (title: string, items: NavItem[]) => (
    <div className="app-rail-section">
      <h2 className="sidebar-nav-heading">{title}</h2>
      {renderNav(items)}
    </div>
  );

  return (
    <div className="app-shell">
      <aside className="app-rail" data-collapsed={collapsed ? "true" : "false"}>
        <div className="app-rail__head">
          <NavLink
            to="/app"
            className="app-rail__brand text-theme-text no-underline transition-opacity duration-[var(--duration)] hover:opacity-85"
            aria-label="Today"
            title={collapsed ? "Today" : undefined}
          >
            <KlickLogo />
          </NavLink>
          <button
            type="button"
            className="app-rail-toggle"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="app-rail-nav"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <IconChevronRail collapsed={collapsed} />
          </button>
        </div>

        <div className="app-rail__meta">
          <div className="app-rail__meta-line">{workspace.name}</div>
          <div className="app-rail__meta-sub">{accountEmail ?? "Signed in"}</div>
        </div>

        <nav id="app-rail-nav" className="app-rail__scroll thin-scrollbar" aria-label="Workspace">
          {navBlock("Pulse", primary)}
          {navBlock("Work", work)}
          {navBlock("Context", context)}
          {navBlock("Agents", automate)}
          {navBlock("Workspace", workspaceNav)}
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
          <ThemeAppearanceToggle compact={collapsed} />
        </div>
      </aside>

      <main className="app-canvas">
        <Outlet />
      </main>

      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
