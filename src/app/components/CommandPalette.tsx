import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Item = { id: string; label: string; hint?: string; to: string };

const NAV: Item[] = [
  { id: "today", label: "Today", hint: "Home", to: "/app" },
  { id: "inbox", label: "Inbox", hint: "Triage", to: "/app/inbox" },
  { id: "threads", label: "Threads", hint: "Channels", to: "/app/threads" },
  { id: "issues", label: "Issues", hint: "Linear", to: "/app/issues" },
  { id: "tasks", label: "Tasks", hint: "Checklists", to: "/app/tasks" },
  { id: "projects", label: "Projects", hint: "Roadmap", to: "/app/projects" },
  { id: "docs", label: "Docs", hint: "Notion", to: "/app/docs" },
  { id: "people", label: "People", hint: "Directory", to: "/app/people" },
  { id: "dex", label: "Dex", hint: "AI superagent", to: "/app/dex" },
  { id: "playbooks", label: "Playbooks", to: "/app/playbooks" },
  { id: "runs", label: "Runs", to: "/app/runs" },
  { id: "integrations", label: "Integrations", to: "/app/integrations" },
  { id: "settings", label: "Settings", to: "/app/settings" },
];

const QUICK: Item[] = [
  { id: "dex-ask", label: "Ask Dex…", hint: "AI", to: "/app/dex" },
  { id: "ni", label: "New issue…", to: "/app/issues?new=1" },
  { id: "nd", label: "New doc…", to: "/app/docs" },
];

type Props = { open: boolean; onClose: () => void };

function CommandPaletteOpen({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const all = useMemo(() => [...QUICK, ...NAV], []);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter(
      (i) =>
        i.label.toLowerCase().includes(s) ||
        i.hint?.toLowerCase().includes(s) ||
        i.id.includes(s),
    );
  }, [all, q]);

  const safeIdx = filtered.length === 0 ? 0 : Math.min(idx, filtered.length - 1);

  const go = useCallback(
    (item: Item) => {
      nav(item.to);
      onClose();
    },
    [nav, onClose],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" && filtered[safeIdx]) {
        e.preventDefault();
        go(filtered[safeIdx]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, safeIdx, go, onClose]);

  return (
    <>
      <button
        type="button"
        className="palette-backdrop cursor-default border-0 p-0"
        aria-label="Close command palette"
        onClick={onClose}
      />
      <div className="palette-panel" role="dialog" aria-label="Command palette">
        <div className="border-b border-theme-border-01 p-2">
          <input
            className="app-input w-full border-0 bg-transparent px-2 py-2 text-base shadow-none focus-visible:shadow-none"
            placeholder="Jump or create…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            autoFocus
          />
        </div>
        <ul className="max-h-[min(360px,50vh)] overflow-y-auto thin-scrollbar p-1">
          {filtered.length === 0 ? (
            <li className="type-sm px-3 py-4 text-theme-text-sec">No matches.</li>
          ) : (
            filtered.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`thread-row flex w-full items-center justify-between rounded-xs border-0 px-3 py-2.5 text-left type-sm ${
                    i === safeIdx ? "bg-theme-card-03-hex text-theme-text" : "bg-transparent text-theme-text-sec"
                  }`}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => go(item)}
                >
                  <span className="font-medium text-theme-text">{item.label}</span>
                  {item.hint ? (
                    <span className="type-product-sm text-theme-text-tertiary">{item.hint}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="type-product-sm flex flex-wrap gap-3 border-t border-theme-border-01 px-3 py-2 text-theme-text-tertiary">
          <span>
            <span className="app-kbd">↑</span> <span className="app-kbd">↓</span> navigate
          </span>
          <span>
            <span className="app-kbd">↵</span> open
          </span>
          <span>
            <span className="app-kbd">esc</span> close
          </span>
        </div>
      </div>
    </>
  );
}

export function CommandPalette({ open, onClose }: Props) {
  if (!open) return null;
  return <CommandPaletteOpen onClose={onClose} />;
}
