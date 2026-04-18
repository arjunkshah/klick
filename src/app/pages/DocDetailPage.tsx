import { Link, useParams } from "react-router-dom";
import { useKlickStore } from "../../data/store";
export function DocDetailPage() {
  const { docId } = useParams();
  const docs = useKlickStore((s) => s.docs);
  const docFolders = useKlickStore((s) => s.docFolders);
  const issues = useKlickStore((s) => s.issues);
  const updateDoc = useKlickStore((s) => s.updateDoc);

  const doc = docs.find((d) => d.id === docId);

  if (!doc || !docId) {
    return (
      <div className="p-g2">
        <p className="text-theme-text-sec">Doc not found.</p>
        <Link to="/app/docs" className="btn-tertiary">
          Back to docs
        </Link>
      </div>
    );
  }

  const linked = issues.filter((i) => doc.linkedIssueIds.includes(i.id));
  const folder = doc.folderId ? docFolders.find((f) => f.id === doc.folderId) : null;
  const childPages = docs.filter((d) => d.parentId === doc.id);
  const parentPage = doc.parentId ? docs.find((d) => d.id === doc.parentId) : null;

  return (
    <div className="mx-auto max-w-prose-medium-wide px-g2 py-v2">
      <div className="type-product-sm mb-v1 flex flex-wrap items-center gap-1 text-theme-text-tertiary">
        <Link to="/app/docs" className="text-theme-accent no-underline hover:underline">
          Docs
        </Link>
        {folder ? (
          <>
            <span>/</span>
            <span>
              {folder.icon} {folder.name}
            </span>
          </>
        ) : null}
        {parentPage ? (
          <>
            <span>/</span>
            <Link
              to={`/app/docs/${parentPage.id}`}
              className="text-theme-accent no-underline hover:underline"
            >
              {parentPage.title}
            </Link>
          </>
        ) : null}
      </div>
      <input
        className="type-md mb-v2 w-full border-0 bg-transparent p-0 font-medium outline-none"
        value={doc.title}
        onChange={(e) => updateDoc(doc.id, { title: e.target.value })}
      />
      {childPages.length > 0 ? (
        <div className="card card--large !mb-v2 !p-g1.5">
          <div className="type-product-sm mb-2 text-theme-text-tertiary">Sub-pages</div>
          <ul className="space-y-1">
            {childPages.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/app/docs/${c.id}`}
                  className="type-sm text-theme-accent no-underline hover:underline"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <textarea
        className="app-input min-h-[320px] w-full font-mono text-sm leading-relaxed"
        value={doc.content}
        onChange={(e) => updateDoc(doc.id, { content: e.target.value })}
        placeholder="Write in Markdown…"
      />
      <p className="type-product-sm mt-2 text-theme-text-tertiary">
        Linked issues appear in backlinks; agent-suggested blocks use the Agent chip in Issues.
      </p>
      {linked.length > 0 ? (
        <div className="mt-v2">
          <h2 className="type-sm mb-1 text-theme-text-sec">Backlinks · issues</h2>
          <ul className="list-inside list-disc">
            {linked.map((i) => (
              <li key={i.id}>
                <Link to={`/app/issues/${i.id}`} className="text-theme-accent">
                  {i.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
