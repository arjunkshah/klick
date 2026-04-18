import { NavLink, Outlet } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function ThreadsLayout() {
  const channels = useKlickStore((s) => s.channels);
  const addChannel = useKlickStore((s) => s.addChannel);

  return (
    <div className="flex h-full min-h-0 bg-theme-bg">
      <div className="flex w-[260px] shrink-0 flex-col border-r border-theme-border-01 bg-theme-card-hex">
        <div className="border-b border-theme-border-01 px-g2 py-v2">
          <h2 className="footer-heading !px-0">Channels</h2>
          <button
            type="button"
            className="btn btn--secondary btn--sm mt-1 w-full"
            onClick={() => {
              const n = prompt("Channel name (lowercase, no spaces)");
              if (n?.trim()) addChannel(n.trim().replace(/\s+/g, "-"), "public");
            }}
          >
            + Channel
          </button>
        </div>
        <nav className="app-rail__scroll thin-scrollbar flex-1 px-g1 pt-v1">
          {channels.map((ch) => (
            <NavLink
              key={ch.id}
              to={`/app/threads/${ch.id}`}
              className={({ isActive }) =>
                isActive ? "app-nav-link app-nav-link--active" : "app-nav-link"
              }
            >
              <span className="truncate">
                {ch.type === "dm" ? "@" : "#"}
                {ch.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-theme-bg">
        <Outlet />
      </div>
    </div>
  );
}
