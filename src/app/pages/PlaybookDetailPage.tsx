import { Link, useNavigate, useParams } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function PlaybookDetailPage() {
  const { playbookId } = useParams();
  const nav = useNavigate();
  const playbooks = useKlickStore((s) => s.playbooks);
  const updatePlaybook = useKlickStore((s) => s.updatePlaybook);
  const startRun = useKlickStore((s) => s.startRun);

  const pb = playbooks.find((p) => p.id === playbookId);

  if (!pb || !playbookId) {
    return (
      <div>
        <p className="text-theme-text-sec">Playbook not found.</p>
        <Link to="/app/playbooks" className="btn-tertiary">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <Link to="/app/playbooks" className="type-sm text-theme-text-sec hover:text-theme-text">
        ← Playbooks
      </Link>
      <div className="mt-v2 flex flex-col gap-v2">
        <input
          className="type-md w-full border-0 bg-transparent p-0 font-medium outline-none"
          value={pb.name}
          onChange={(e) => updatePlaybook(pb.id, { name: e.target.value })}
        />
        <textarea
          className="type-base min-h-[72px] rounded-xs border border-theme-border-02 bg-theme-bg px-3 py-2"
          value={pb.description}
          onChange={(e) => updatePlaybook(pb.id, { description: e.target.value })}
        />
        <div>
          <h2 className="type-base mb-v1">Steps</h2>
          <ol className="list-decimal space-y-2 pl-5">
            {pb.steps.map((s) => (
              <li key={s.id} className="type-sm">
                <span className="font-medium">{s.title}</span>{" "}
                <span className="text-theme-text-mid">({s.type})</span>
                {s.autonomy ? (
                  <span className="text-theme-text-sec"> · {s.autonomy}</span>
                ) : null}
                <p className="text-theme-text-sec">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
        <button
          type="button"
          className="btn w-fit"
          onClick={() => {
            const runId = startRun(pb.id);
            if (runId) nav(`/app/runs/${runId}`);
          }}
        >
          Run playbook
        </button>
      </div>
    </div>
  );
}
