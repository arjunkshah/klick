import { Link } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function RunsPage() {
  const runs = useKlickStore((s) => s.runs);

  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <h1 className="type-md mb-v1">Runs</h1>
      <p className="type-base text-theme-text-sec mb-v2">
        Audit trail for playbook executions.
      </p>
      <ul className="space-y-g1">
        {runs.map((r) => (
          <li key={r.id} className="card !p-g1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                to={`/app/runs/${r.id}`}
                className="type-base font-medium text-theme-text no-underline hover:text-theme-accent"
              >
                {r.playbookName}
              </Link>
              <span className="type-sm capitalize text-theme-text-mid">{r.status}</span>
            </div>
            <div className="type-sm mt-1 text-theme-text-sec">
              Started {new Date(r.startedAt).toLocaleString()}
              {r.completedAt ? ` · Done ${new Date(r.completedAt).toLocaleString()}` : ""}
            </div>
          </li>
        ))}
      </ul>
      {runs.length === 0 ? (
        <p className="type-base text-theme-text-sec">
          No runs yet. Start one from{" "}
          <Link to="/app/playbooks" className="text-theme-accent">
            Playbooks
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
