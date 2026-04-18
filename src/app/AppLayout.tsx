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
      <h2 className="footer-heading">{title}</h2>
      {renderNav(items)}
    </div>
  );

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="container app-topbar-inner w-full max-w-none">
          <div className="flex min-w-0 flex-1 items-center gap-x-g1">
            <NavLink
              to="/app"
              className="relative top-[0.15rem] inline-flex shrink-0 items-center text-theme-text no-underline transition-opacity duration-[var(--duration)] hover:opacity-85"
              aria-label="Today"
            >
              <KlickLogo />
            </NavLink>
            <span
              className="hidden h-5 w-px shrink-0 bg-theme-border-02 sm:block"
              aria-hidden
            />
            <div className="min-w-0">
              <div className="type-sm font-medium leading-tight text-theme-text truncate">
                {workspace.name}
              </div>
              <div className="type-product-sm truncate text-theme-text-tertiary">
                {accountEmail ?? "Signed in"}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-2">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setOpen(true)}
              title="Command palette"
            >
              <span className="type-sm">Search</span>
              <span className="app-kbd ml-1">⌘K</span>
            </button>
            <NavLink to="/app/issues?new=1" className="btn btn--sm no-underline">
              New issue
            </NavLink>
            <ThemeAppearanceToggle />
            <button
              type="button"
              className="btn--quinary type-sm px-2 transition-opacity duration-[var(--duration)] hover:opacity-80"
              onClick={() => {
                void signOutUser().then(() => navigate("/"));
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="app-shell__body">
        <aside className="app-rail" data-collapsed={collapsed ? "true" : "false"}>
          <div className="app-rail-toolbar">
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
          <div id="app-rail-nav" className="app-rail__scroll thin-scrollbar">
            {navBlock("Pulse", primary)}
            {navBlock("Work", work)}
            {navBlock("Context", context)}
            {navBlock("Agents", automate)}
            {navBlock("Workspace", workspaceNav)}
          </div>
        </aside>

        <div className="app-canvas">
          <Outlet />
        </div>
      </div>

      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
