import {
  Bold,
  ChevronRight,
  Code2,
  FileText,
  FolderPlus,
  Italic,
  Link2,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Search,
  Sparkles,
  Strikethrough,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  applyTriggerReplacement,
  filterSlashCommands,
  getTriggerMenu,
  type SlashCommand,
  toggleLinePrefix,
  wrapSelection,
  type TriggerMenu,
} from "../docs/docEditorUtils";
import type { Doc, DocFolder, Issue, TeamMember } from "../../data/types";
import { useKlickStore } from "../../data/store";

const SIDEBAR_COLLAPSED_KEY = "klick-docs-sidebar-collapsed";

function formatUpdated(iso: string): string {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  return t.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function snippet(content: string): string {
  const line = content.trim().split("\n").find((l) => l.trim()) ?? "";
  const s = line.slice(0, 72);
  return s.length < line.length ? `${s}…` : s;
}

function TreeLevel({
  parentFolderId,
  depth,
  folders,
  docs,
  selectedId,
  onPick,
  onNewInFolder,
}: {
  parentFolderId: string | null;
  depth: number;
  folders: DocFolder[];
  docs: Doc[];
  selectedId: string | null;
  onPick: (id: string) => void;
  onNewInFolder: (folderId: string) => void;
}) {
  const subfolders = useMemo(
    () =>
      [...folders]
        .filter((f) => f.parentFolderId === parentFolderId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [folders, parentFolderId],
  );
  const looseDocs = useMemo(
    () =>
      [...docs]
        .filter((d) => d.folderId === parentFolderId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [docs, parentFolderId],
  );

  const pad = 10 + depth * 12;

  return (
    <>
      {subfolders.map((folder) => (
        <div key={folder.id} className="docs-tree__nest">
          <div className="docs-tree__folder-head" style={{ paddingLeft: pad }}>
            <ChevronRight className="docs-tree__chevron" size={14} strokeWidth={1.75} aria-hidden />
            <span className="docs-tree__folder-icon" aria-hidden>
              {folder.icon}
            </span>
            <span className="docs-tree__folder-name">{folder.name}</span>
            <button
              type="button"
              className="docs-tree__folder-add"
              title="New doc in folder"
              onClick={() => onNewInFolder(folder.id)}
            >
              <Plus size={14} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <TreeLevel
            parentFolderId={folder.id}
            depth={depth + 1}
            folders={folders}
            docs={docs}
            selectedId={selectedId}
            onPick={onPick}
            onNewInFolder={onNewInFolder}
          />
        </div>
      ))}
      {looseDocs.map((doc) => (
        <button
          key={doc.id}
          type="button"
          className={`docs-tree__doc${doc.id === selectedId ? " docs-tree__doc--active" : ""}`}
          style={{ paddingLeft: pad + 14 }}
          onClick={() => onPick(doc.id)}
        >
          <FileText className="docs-tree__doc-icon" size={14} strokeWidth={1.75} aria-hidden />
          <span className="docs-tree__doc-title">{doc.title || "Untitled"}</span>
          <span className="docs-tree__doc-hint">{snippet(doc.content) || "Empty"}</span>
        </button>
      ))}
    </>
  );
}

type AtItem =
  | { type: "person"; member: TeamMember }
  | { type: "issue"; issue: Issue };

function DocsEditor({
  doc,
  issues,
  members,
  updateDoc,
}: {
  doc: Doc;
  issues: Issue[];
  members: TeamMember[];
  updateDoc: (docId: string, patch: Partial<Doc>) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuKeyRef = useRef("");
  const [title, setTitle] = useState(doc.title);
  const [body, setBody] = useState(doc.content);
  const [menu, setMenu] = useState<TriggerMenu | null>(null);
  const [menuIndex, setMenuIndex] = useState(0);

  const flushTitle = useCallback(() => {
    const t = title.trim() || "Untitled doc";
    if (t !== doc.title) updateDoc(doc.id, { title: t });
  }, [doc.id, doc.title, title, updateDoc]);

  const applyBody = useCallback(
    (next: string, selStart: number, selEnd: number) => {
      setBody(next);
      updateDoc(doc.id, { content: next });
      setMenu(null);
      menuKeyRef.current = "";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = taRef.current;
          if (!el) return;
          el.focus();
          el.setSelectionRange(selStart, selEnd);
        });
      });
    },
    [doc.id, updateDoc],
  );

  const syncMenuFromValue = useCallback((value: string, cursor: number) => {
    const m = getTriggerMenu(value, cursor);
    const key = m ? `${m.kind}:${m.start}:${m.query}` : "";
    if (key !== menuKeyRef.current) {
      menuKeyRef.current = key;
      setMenuIndex(0);
    }
    setMenu(m);
  }, []);

  const readMenuFromCaret = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    syncMenuFromValue(ta.value, ta.selectionStart);
  }, [syncMenuFromValue]);

  const fmtBold = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const r = wrapSelection(value, s, e, "**", "**");
    applyBody(r.text, r.selStart, r.selEnd);
  }, [applyBody]);

  const fmtItalic = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const r = wrapSelection(value, s, e, "*", "*");
    applyBody(r.text, r.selStart, r.selEnd);
  }, [applyBody]);

  const fmtCode = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const r = wrapSelection(value, s, e, "`", "`");
    applyBody(r.text, r.selStart, r.selEnd);
  }, [applyBody]);

  const fmtStrike = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const r = wrapSelection(value, s, e, "~~", "~~");
    applyBody(r.text, r.selStart, r.selEnd);
  }, [applyBody]);

  const fmtLink = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e);
    const urlDefault = "https://";
    const url =
      typeof window !== "undefined"
        ? window.prompt("Link URL", urlDefault)
        : null;
    if (url === null) return;
    const label = sel.trim() || "link";
    const insert = `[${label}](${url || urlDefault})`;
    const next = value.slice(0, s) + insert + value.slice(e);
    const pos = s + insert.length;
    applyBody(next, pos, pos);
  }, [applyBody]);

  const fmtHeading = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const c = ta.selectionStart;
    const r = toggleLinePrefix(ta.value, c, "## ");
    applyBody(r.text, r.cursor, r.cursor);
  }, [applyBody]);

  const fmtBullet = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const c = ta.selectionStart;
    const r = toggleLinePrefix(ta.value, c, "- ");
    applyBody(r.text, r.cursor, r.cursor);
  }, [applyBody]);

  const slashItems = useMemo(
    () => (menu?.kind === "slash" ? filterSlashCommands(menu.query) : []),
    [menu],
  );

  const atItems = useMemo((): AtItem[] => {
    if (!menu || menu.kind !== "at") return [];
    const q = menu.query;
    const people: AtItem[] = members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.email && m.email.toLowerCase().includes(q)),
      )
      .slice(0, 8)
      .map((m) => ({ type: "person" as const, member: m }));
    const iss: AtItem[] = issues
      .filter((i) => i.title.toLowerCase().includes(q))
      .slice(0, 10)
      .map((i) => ({ type: "issue" as const, issue: i }));
    return [...people, ...iss];
  }, [menu, members, issues]);

  const flatMenuLen = menu?.kind === "slash" ? slashItems.length : atItems.length;

  useLayoutEffect(() => {
    const el = menuRef.current?.querySelector<HTMLElement>(".docs-cmd-menu__item--active");
    el?.scrollIntoView({ block: "nearest" });
  }, [menuIndex, menu, slashItems, atItems]);

  function pickSlash(cmd: SlashCommand) {
    const ta = taRef.current;
    if (!ta || !menu || menu.kind !== "slash") return;
    const cur = ta.selectionStart;
    const { text, selStart, selEnd } = applyTriggerReplacement(
      ta.value,
      menu.start,
      cur,
      cmd.insert,
      cmd.cursorOffset,
    );
    applyBody(text, selStart, selEnd);
  }

  function makeAtPickHandler(item: AtItem) {
    return () => {
      const ta = taRef.current;
      const m = menu;
      if (!ta || !m || m.kind !== "at") return;
      const cur = ta.selectionStart;
      let ins: string;
      let nextLinks: string[] | undefined;
      if (item.type === "person") {
        ins = `@${item.member.name} `;
      } else {
        const safe = item.issue.title.replace(/[[\]]/g, "");
        ins = `[${safe}](/app/issues) `;
        const latest = useKlickStore.getState().docs.find((d) => d.id === doc.id);
        const prev = latest?.linkedIssueIds ?? [];
        nextLinks = prev.includes(item.issue.id) ? prev : [...prev, item.issue.id];
      }
      const { text, selStart, selEnd } = applyTriggerReplacement(ta.value, m.start, cur, ins);
      setBody(text);
      updateDoc(
        doc.id,
        nextLinks !== undefined ? { content: text, linkedIssueIds: nextLinks } : { content: text },
      );
      setMenu(null);
      menuKeyRef.current = "";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = taRef.current;
          if (!el) return;
          el.focus();
          el.setSelectionRange(selStart, selEnd);
        });
      });
    };
  }

  const onBodyChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      const c = e.target.selectionStart;
      setBody(v);
      updateDoc(doc.id, { content: v });
      syncMenuFromValue(v, c);
    },
    [doc.id, updateDoc, syncMenuFromValue],
  );

  const onBodySelect = useCallback(() => {
    readMenuFromCaret();
  }, [readMenuFromCaret]);

  function onBodyKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const ta = taRef.current;
    if (!ta) return;

    if (menu && flatMenuLen > 0) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenu(null);
        menuKeyRef.current = "";
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMenuIndex((i) => Math.min(flatMenuLen - 1, i + 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMenuIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (menu.kind === "slash") {
          const cmd = slashItems[menuIndex];
          if (cmd) pickSlash(cmd);
        } else {
          const it = atItems[menuIndex];
          if (it) makeAtPickHandler(it)();
        }
        return;
      }
    }

    const mod = e.metaKey || e.ctrlKey;
    if (mod && !e.altKey) {
      const k = e.key.toLowerCase();
      if (k === "b") {
        e.preventDefault();
        fmtBold();
        return;
      }
      if (k === "i") {
        e.preventDefault();
        fmtItalic();
        return;
      }
      if (k === "k") {
        e.preventDefault();
        fmtLink();
        return;
      }
      if (k === "`" || e.code === "Backquote") {
        e.preventDefault();
        fmtCode();
        return;
      }
      if (k === "s" && e.shiftKey) {
        e.preventDefault();
        fmtStrike();
        return;
      }
      if (k === "8" && e.shiftKey) {
        e.preventDefault();
        fmtBullet();
        return;
      }
      if (k === "7" && e.shiftKey) {
        e.preventDefault();
        const c = ta.selectionStart;
        const r = toggleLinePrefix(ta.value, c, "1. ");
        applyBody(r.text, r.cursor, r.cursor);
      }
    }
  }

  return (
    <>
      <div className="docs-editor__head">
        <input
          className="docs-editor__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={flushTitle}
          placeholder="Untitled doc"
          aria-label="Document title"
        />
        <div className="docs-editor__meta">
          <span>Updated {formatUpdated(doc.updatedAt)}</span>
          <span className="docs-editor__meta-dot" aria-hidden />
          <span className="docs-editor__meta-hint">
            <kbd className="docs-kbd">Ctrl/⌘B</kbd> bold · <kbd className="docs-kbd">Ctrl/⌘I</kbd> italic ·{" "}
            <kbd className="docs-kbd">Ctrl/⌘K</kbd> link · <kbd className="docs-kbd">/</kbd> slash ·{" "}
            <kbd className="docs-kbd">@</kbd> people &amp; issues
          </span>
        </div>
      </div>
      <LinkedIssues ids={doc.linkedIssueIds} issues={issues} />

      <div className="docs-editor__fmt">
        <span className="docs-editor__fmt-label">Format</span>
        <div className="docs-editor__fmt-btns">
          <button type="button" className="docs-fmt-btn" title="Bold (Ctrl/⌘B)" onClick={fmtBold}>
            <Bold size={15} strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" className="docs-fmt-btn" title="Italic (Ctrl/⌘I)" onClick={fmtItalic}>
            <Italic size={15} strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" className="docs-fmt-btn" title="Inline code (Ctrl/⌘`)" onClick={fmtCode}>
            <Code2 size={15} strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" className="docs-fmt-btn" title="Strikethrough (Ctrl/⌘⇧S)" onClick={fmtStrike}>
            <Strikethrough size={15} strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" className="docs-fmt-btn" title="Link (Ctrl/⌘K)" onClick={fmtLink}>
            <Link2 size={15} strokeWidth={1.75} aria-hidden />
          </button>
          <span className="docs-editor__fmt-sep" aria-hidden />
          <button type="button" className="docs-fmt-btn docs-fmt-btn--text" title="Heading (##)" onClick={fmtHeading}>
            H2
          </button>
          <button
            type="button"
            className="docs-fmt-btn docs-fmt-btn--text"
            title="Bullet (Ctrl/⌘⇧8)"
            onClick={fmtBullet}
          >
            • List
          </button>
        </div>
      </div>

      <div className="docs-editor__body-wrap">
        <textarea
          ref={taRef}
          className="docs-editor__body thin-scrollbar"
          value={body}
          onChange={onBodyChange}
          onKeyDown={onBodyKeyDown}
          onSelect={onBodySelect}
          onKeyUp={onBodySelect}
          onClick={onBodySelect}
          placeholder={
            "Write…\n\nType / for blocks, @ for people & issues. **bold** *italic* `code` — synced to your workspace."
          }
          spellCheck
          aria-label="Document body"
        />

        {menu && flatMenuLen > 0 ? (
          <div
            ref={menuRef}
            className="docs-cmd-menu thin-scrollbar"
            role="listbox"
            aria-label={menu.kind === "slash" ? "Slash commands" : "Mentions"}
          >
            {menu.kind === "slash"
              ? slashItems.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    type="button"
                    role="option"
                    aria-selected={i === menuIndex}
                    className={`docs-cmd-menu__item${i === menuIndex ? " docs-cmd-menu__item--active" : ""}`}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => pickSlash(cmd)}
                  >
                    <span className="docs-cmd-menu__item-label">{cmd.label}</span>
                    <span className="docs-cmd-menu__item-hint">{cmd.hint}</span>
                  </button>
                ))
              : atItems.map((item, i) => {
                  const active = i === menuIndex;
                  return item.type === "person" ? (
                    <button
                      key={`p-${item.member.id}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`docs-cmd-menu__item${active ? " docs-cmd-menu__item--active" : ""}`}
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={makeAtPickHandler(item)}
                    >
                      <span className="docs-cmd-menu__item-kicker">Person</span>
                      <span className="docs-cmd-menu__item-label">{item.member.name}</span>
                      <span className="docs-cmd-menu__item-hint">{item.member.email}</span>
                    </button>
                  ) : (
                    <button
                      key={`i-${item.issue.id}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`docs-cmd-menu__item${active ? " docs-cmd-menu__item--active" : ""}`}
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={makeAtPickHandler(item)}
                    >
                      <span className="docs-cmd-menu__item-kicker">Issue</span>
                      <span className="docs-cmd-menu__item-label">{item.issue.title}</span>
                      <span className="docs-cmd-menu__item-hint">Link + pin to doc</span>
                    </button>
                  );
                })}
          </div>
        ) : null}
      </div>
    </>
  );
}

function LinkedIssues({ ids, issues }: { ids: string[]; issues: Issue[] }) {
  if (ids.length === 0) return null;
  const map = new Map(issues.map((i) => [i.id, i]));
  return (
    <div className="docs-editor__links">
      <span className="docs-editor__links-label">Linked issues</span>
      <ul className="docs-editor__links-list">
        {ids.map((id) => {
          const issue = map.get(id);
          return (
            <li key={id}>
              <Link to="/app/issues" className="docs-editor__issue-chip">
                {issue?.title ?? id.slice(0, 8)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DocsPage() {
  const workspace = useKlickStore((s) => s.workspace);
  const docFolders = useKlickStore((s) => s.docFolders);
  const docs = useKlickStore((s) => s.docs);
  const issues = useKlickStore((s) => s.issues);
  const members = useKlickStore((s) => s.members);
  const addDoc = useKlickStore((s) => s.addDoc);
  const addDocFolder = useKlickStore((s) => s.addDocFolder);
  const updateDoc = useKlickStore((s) => s.updateDoc);

  const [params, setParams] = useSearchParams();
  const selectedId = params.get("d");
  const [query, setQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  const active = useMemo(
    () => (selectedId ? docs.find((d) => d.id === selectedId) ?? null : null),
    [docs, selectedId],
  );

  useEffect(() => {
    if (docs.length === 0) {
      if (selectedId) setParams({}, { replace: true });
      return;
    }
    if (!selectedId || !docs.some((d) => d.id === selectedId)) {
      const newest = [...docs].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0];
      setParams({ d: newest.id }, { replace: true });
    }
  }, [docs, selectedId, setParams]);

  const pick = useCallback(
    (id: string) => {
      setParams({ d: id }, { replace: true });
    },
    [setParams],
  );

  const handleNew = useCallback(
    (folderId: string | null) => {
      const id = addDoc("Untitled doc", null, folderId);
      setParams({ d: id }, { replace: true });
    },
    [addDoc, setParams],
  );

  const handleNewFolder = useCallback(() => {
    addDocFolder("New folder", null, "📁");
  }, [addDocFolder]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => {
      const n = !c;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, n ? "1" : "0");
      } catch {
        /* ignore */
      }
      return n;
    });
  }, []);

  const rootDocCount = docs.filter((d) => d.folderId === null).length;

  const q = query.trim().toLowerCase();
  const searchHits = useMemo(() => {
    if (!q) return null;
    return [...docs]
      .filter((d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [docs, q]);

  return (
    <div className="app-page app-page--docs docs-page">
      <header className="docs-page__intro">
        <div className="docs-page__intro-inner">
          <div>
            <p className="docs-page__eyebrow">{workspace.name}</p>
            <h1 className="docs-page__title">Docs</h1>
            <p className="docs-page__lede">
              A calm place for decisions, specs, and context—<strong>synced with your workspace</strong> so Dex
              and the rest of the app stay aligned.
            </p>
          </div>
          <div className="docs-page__intro-actions">
            <button type="button" className="docs-toolbar-btn docs-toolbar-btn--ghost" onClick={handleNewFolder}>
              <FolderPlus size={16} strokeWidth={1.65} aria-hidden />
              Folder
            </button>
            <button
              type="button"
              className="docs-toolbar-btn docs-toolbar-btn--primary"
              onClick={() => handleNew(null)}
            >
              <Plus size={16} strokeWidth={1.65} aria-hidden />
              New doc
            </button>
          </div>
        </div>
      </header>

      <div className={sidebarCollapsed ? "docs-shell docs-shell--collapsed" : "docs-shell"}>
        <aside className="docs-sidebar" aria-label="Document library">
          <div className="docs-sidebar__toolbar">
            {sidebarCollapsed ? (
              <button
                type="button"
                className="docs-sidebar__icon-btn"
                onClick={toggleSidebar}
                title="Show library"
                aria-expanded={false}
              >
                <PanelLeft size={18} strokeWidth={1.65} aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                className="docs-sidebar__icon-btn"
                onClick={toggleSidebar}
                title="Hide library"
                aria-expanded={true}
              >
                <PanelLeftClose size={18} strokeWidth={1.65} aria-hidden />
              </button>
            )}
          </div>

          {!sidebarCollapsed ? (
            <>
              <div className="docs-sidebar__search">
                <Search className="docs-sidebar__search-icon" size={15} strokeWidth={1.75} aria-hidden />
                <input
                  type="search"
                  className="docs-sidebar__search-input"
                  placeholder="Search titles and bodies…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search docs"
                />
              </div>
              <div className="docs-sidebar__scroll thin-scrollbar">
                {docs.length === 0 ? (
                  <div className="docs-sidebar__empty">
                    <Sparkles size={18} strokeWidth={1.65} aria-hidden />
                    <p>No docs yet</p>
                    <button type="button" className="docs-empty-cta" onClick={() => handleNew(null)}>
                      Write the first one
                    </button>
                  </div>
                ) : searchHits ? (
                  searchHits.length === 0 ? (
                    <p className="docs-sidebar__no-hits">No matching docs.</p>
                  ) : (
                    <div className="docs-search-hits" role="list">
                      {searchHits.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          role="listitem"
                          className={`docs-tree__doc docs-tree__doc--flat${doc.id === selectedId ? " docs-tree__doc--active" : ""}`}
                          onClick={() => pick(doc.id)}
                        >
                          <FileText className="docs-tree__doc-icon" size={14} strokeWidth={1.75} aria-hidden />
                          <span className="docs-tree__doc-title">{doc.title || "Untitled"}</span>
                          <span className="docs-tree__doc-hint">{snippet(doc.content) || "Empty"}</span>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <TreeLevel
                    parentFolderId={null}
                    depth={0}
                    folders={docFolders}
                    docs={docs}
                    selectedId={selectedId}
                    onPick={pick}
                    onNewInFolder={(fid) => handleNew(fid)}
                  />
                )}
              </div>
              <footer className="docs-sidebar__foot">
                {docs.length > 0 ? (
                  <span>
                    {docs.length} doc{docs.length === 1 ? "" : "s"}
                    {rootDocCount > 0 ? ` · ${rootDocCount} at library root` : ""}
                  </span>
                ) : (
                  <span>Library empty</span>
                )}
              </footer>
            </>
          ) : null}
        </aside>

        <section className="docs-main" aria-label="Editor">
          {docs.length === 0 ? (
            <div className="docs-empty-main">
              <div className="docs-empty-main__card">
                <h2 className="docs-empty-main__title">Start your knowledge base</h2>
                <p className="docs-empty-main__text">
                  Capture architecture notes, decision logs, and onboarding—all in one place. Everything here is
                  persisted to Firestore with the rest of your workspace.
                </p>
                <button
                  type="button"
                  className="docs-toolbar-btn docs-toolbar-btn--primary"
                  onClick={() => handleNew(null)}
                >
                  <Plus size={16} strokeWidth={1.65} aria-hidden />
                  Create doc
                </button>
              </div>
            </div>
          ) : active ? (
            <DocsEditor
              key={active.id}
              doc={active}
              issues={issues}
              members={members}
              updateDoc={updateDoc}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
