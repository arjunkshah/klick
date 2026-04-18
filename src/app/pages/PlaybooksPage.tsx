import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function PlaybooksPage() {
  const playbooks = useKlickStore((s) => s.playbooks);

  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <h1 className="type-md mb-v1">Playbooks</h1>
      <p className="type-base text-theme-text-sec mb-v2">
        Human + agent steps with approvals. Run manually in v1.
      </p>
      <ul className="space-y-g1">
        {playbooks.map((p) => (
          <li key={p.id} className="card !p-g1.5">
            <Link
              to={`/app/playbooks/${p.id}`}
              className="type-base font-medium text-theme-text no-underline hover:text-theme-accent"
            >
              {p.name}
            </Link>
            <p className="type-sm mt-1 text-theme-text-sec">{p.description}</p>
            <div className="type-sm mt-1 text-theme-text-mid">
              {p.steps.length} steps
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
