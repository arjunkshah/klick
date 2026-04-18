import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useKlickStore } from "../../data/store";
import type { Doc, DocFolder } from "../../data/types";

function DocChildren({
  parentDocId,
  docs,
  depth,
}: {
  parentDocId: string;
  docs: Doc[];
  depth: number;
}) {
  const loc = useLocation();
  const children = docs.filter((d) => d.parentId === parentDocId);
  if (children.length === 0) return null;
  return (
    <ul className="mt-0.5 space-y-0.5" style={{ paddingLeft: depth * 10 }}>
      {children.map((c) => (
        <li key={c.id}>
          <Link
            to={`/app/docs/${c.id}`}
            className={`thread-row block truncate rounded-xs px-2 py-1 type-sm no-underline ${
              loc.pathname === `/app/docs/${c.id}`
                ? "bg-theme-card-03-hex font-medium text-theme-text"
                : "text-theme-text-sec hover:text-theme-text"
            }`}
          >
            {c.title}
          </Link>
          <DocChildren parentDocId={c.id} docs={docs} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

function FolderBlock({
  folder,
  folders,
  docs,
}: {
  folder: DocFolder;
  folders: DocFolder[];
  docs: Doc[];
}) {
  const loc = useLocation();
  const subfolders = folders.filter((f) => f.parentFolderId === folder.id);
  const pagesHere = docs.filter((d) => d.folderId === folder.id && !d.parentId);

  return (
    <div className="mb-2">
      <div className="type-product-sm mb-1 flex items-center gap-1 px-2 text-theme-text-tertiary">
        <span aria-hidden>{folder.icon}</span>
        <span className="truncate uppercase tracking-wide">{folder.name}</span>
      </div>
      <ul className="space-y-0.5">
        {pagesHere.map((d) => (
          <li key={d.id}>
            <Link
              to={`/app/docs/${d.id}`}
              className={`thread-row block truncate rounded-xs px-2 py-1 type-sm no-underline ${
                loc.pathname === `/app/docs/${d.id}`
                  ? "bg-theme-card-03-hex font-medium text-theme-text"
                  : "text-theme-text-sec hover:text-theme-text"
              }`}
            >
              {d.title}
            </Link>
            <DocChildren parentDocId={d.id} docs={docs} depth={1} />
          </li>
        ))}
      </ul>
      {subfolders.map((sf) => (
        <div key={sf.id} className="mt-2 pl-2 border-l border-theme-border-01">
          <FolderBlock folder={sf} folders={folders} docs={docs} />
        </div>
      ))}
    </div>
  );
}

export function DocsSidebar() {
  const docs = useKlickStore((s) => s.docs);
  const docFolders = useKlickStore((s) => s.docFolders);
  const addDoc = useKlickStore((s) => s.addDoc);
  const addDocFolder = useKlickStore((s) => s.addDocFolder);
  const loc = useLocation();

  const [newTitle, setNewTitle] = useState("");
  const [folderPick, setFolderPick] = useState<string | "">(
    docFolders[0]?.id ?? "",
  );
  const [newFolderName, setNewFolderName] = useState("");

  const rootFolders = docFolders.filter((f) => !f.parentFolderId);
  const loose = docs.filter((d) => !d.folderId && !d.parentId);

  return (
    <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col border-r border-theme-border-01 bg-theme-card-hex">
      <div className="border-b border-theme-border-01 px-g2 py-v2">
        <h2 className="footer-heading !px-0">Library</h2>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTitle.trim()) return;
            addDoc(
              newTitle.trim(),
              null,
              folderPick || null,
            );
            setNewTitle("");
          }}
        >
          <input
            className="app-input w-full"
            placeholder="New page title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex gap-1">
            <select
              className="app-input min-w-0 flex-1"
              value={folderPick}
              onChange={(e) => setFolderPick(e.target.value)}
            >
              <option value="">No folder</option>
              {docFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.icon} {f.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn--sm shrink-0">
              Add
            </button>
          </div>
        </form>
        <form
          className="mt-2 flex gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newFolderName.trim()) return;
            addDocFolder(newFolderName.trim(), null);
            setNewFolderName("");
          }}
        >
          <input
            className="app-input min-w-0 flex-1"
            placeholder="New folder…"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button type="submit" className="btn btn--secondary btn--sm shrink-0">
            Folder
          </button>
        </form>
      </div>
      <div className="app-rail__scroll thin-scrollbar flex-1 p-2">
        <Link
          to="/app/docs"
          className={`thread-row mb-2 block rounded-xs px-2 py-1.5 type-sm no-underline ${
            loc.pathname === "/app/docs"
              ? "bg-theme-card-03-hex font-medium text-theme-text"
              : "text-theme-text-sec hover:text-theme-text"
          }`}
        >
          Overview
        </Link>
        {loose.length > 0 ? (
          <div className="mb-3">
            <div className="type-product-sm mb-1 px-2 text-theme-text-tertiary">Unfiled</div>
            <ul className="space-y-0.5">
              {loose.map((d) => (
                <li key={d.id}>
                  <Link
                    to={`/app/docs/${d.id}`}
                    className={`thread-row block truncate rounded-xs px-2 py-1 type-sm no-underline ${
                      loc.pathname === `/app/docs/${d.id}`
                        ? "bg-theme-card-03-hex font-medium text-theme-text"
                        : "text-theme-text-sec hover:text-theme-text"
                    }`}
                  >
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {rootFolders.map((f) => (
          <FolderBlock key={f.id} folder={f} folders={docFolders} docs={docs} />
        ))}
      </div>
    </div>
  );
}
