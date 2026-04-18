import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getSession } from "../auth/session";
import { KlickLogo } from "../components/KlickLogo";
import { useKlickStore } from "../data/store";
import { ThemeAppearanceToggle } from "../components/ThemeAppearanceToggle";
import { IconChevronRail } from "./components/NavIcons";
import { useSidebarCollapsed } from "./hooks/useSidebarCollapsed";

export function AppLayout() {
  const navigate = useNavigate();
  const workspace = useKlickStore((s) => s.workspace);
  const { user, signOutUser } = useAuth();
  const session = getSession();
  const accountEmail = user?.email ?? session?.email;
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <div className="app-shell">
      <aside
        className="app-rail"
        id="app-rail"
        data-collapsed={collapsed ? "true" : "false"}
      >
        <div className="app-rail__head">
          <NavLink
            to="/app"
            className="app-rail__brand text-theme-text no-underline transition-opacity duration-[var(--duration)] hover:opacity-85"
            aria-label="Klick"
            title={collapsed ? "Klick" : undefined}
          >
            <KlickLogo />
          </NavLink>
          <button
            type="button"
            className="app-rail-toggle"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="app-rail"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <IconChevronRail collapsed={collapsed} />
          </button>
        </div>

        <div className="app-rail__meta">
          <div className="app-rail__meta-line">{workspace.name}</div>
          <div className="app-rail__meta-sub">{accountEmail ?? "Signed in"}</div>
        </div>

        <div className="app-rail__body" aria-hidden />

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

      <div className="app-canvas app-canvas--void" aria-hidden />
    </div>
  );
}
