import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function DocsHomePage() {
  const docs = useKlickStore((s) => s.docs);
  const folders = useKlickStore((s) => s.docFolders);

  const recent = [...docs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-prose-medium-wide px-g2 py-v2">
      <div className="mb-v2 border-b border-theme-border-01 pb-v2">
        <h1 className="type-md mb-v1">Docs</h1>
        <p className="type-base text-theme-text-sec">
          Folders, nested pages, and backlinks to issues—Notion-shaped context for your build.
        </p>
      </div>
      <div className="mb-v2 grid gap-g1 sm:grid-cols-3">
        <div className="card card--large !p-g1.5">
          <div className="type-product-sm text-theme-text-tertiary">Folders</div>
          <div className="type-xl mt-1">{folders.length}</div>
        </div>
        <div className="card card--large !p-g1.5">
          <div className="type-product-sm text-theme-text-tertiary">Pages</div>
          <div className="type-xl mt-1">{docs.length}</div>
        </div>
        <div className="card card--large !p-g1.5">
          <div className="type-product-sm text-theme-text-tertiary">Linked issues</div>
          <div className="type-xl mt-1">
            {docs.filter((d) => d.linkedIssueIds.length > 0).length}
          </div>
        </div>
      </div>
      <h2 className="type-base mb-v1">Recently updated</h2>
      <ul className="divide-y divide-theme-border-01 rounded-xs border border-theme-border-01 bg-theme-card-hex">
        {recent.slice(0, 8).map((d) => (
          <li key={d.id} className="thread-row">
            <Link
              to={`/app/docs/${d.id}`}
              className="flex items-center justify-between gap-g1 px-g1.5 py-3 no-underline"
            >
              <span className="type-sm font-medium text-theme-text">{d.title}</span>
              <span className="type-product-sm shrink-0 text-theme-text-tertiary">
                {new Date(d.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
