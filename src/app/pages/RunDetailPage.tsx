import { Link, useParams } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function RunDetailPage() {
  const { runId } = useParams();
  const runs = useKlickStore((s) => s.runs);
  const advanceRun = useKlickStore((s) => s.advanceRun);
  const cancelRun = useKlickStore((s) => s.cancelRun);

  const run = runs.find((r) => r.id === runId);

  if (!run || !runId) {
    return (
      <div>
        <p className="text-theme-text-sec">Run not found.</p>
        <Link to="/app/runs" className="btn-tertiary">
          Back to runs
        </Link>
      </div>
    );
  }

  const idx = run.currentStepIndex;
  const current = run.stepLogs[idx];

  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <Link to="/app/runs" className="type-sm text-theme-text-sec hover:text-theme-text">
        ← Runs
      </Link>
      <h1 className="type-md mt-v1 mb-v1">{run.playbookName}</h1>
      <p className="type-sm text-theme-text-sec capitalize">
        Status: {run.status} · Step {Math.min(idx + 1, run.stepLogs.length)} / {run.stepLogs.length}
      </p>

      <ol className="mt-v2 space-y-g1">
        {run.stepLogs.map((log, i) => (
          <li
            key={log.stepId}
            className={`card !p-g1.5 ${i === idx && run.status === "running" ? "border-theme-accent-muted border-2" : ""}`}
          >
            <div className="type-sm font-medium">
              {i + 1}. {log.title}{" "}
              <span className="text-theme-text-mid">({log.type})</span>
            </div>
            <div className="type-sm capitalize text-theme-text-sec">{log.status.replace("_", " ")}</div>
            {log.output ? (
              <pre className="type-product-base-mono mt-2 max-h-48 overflow-auto rounded-xs bg-theme-card-03-hex p-2 text-theme-text-sec whitespace-pre-wrap">
                {log.output}
              </pre>
            ) : null}
            {log.approvedAt ? (
              <div className="type-sm mt-1 text-theme-text-mid">
                Approved {new Date(log.approvedAt).toLocaleString()}
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      {run.status === "running" && current ? (
        <div className="mt-v2 flex flex-wrap gap-2">
          {current.type === "human" && current.status === "pending" ? (
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => advanceRun(run.id, "complete_human")}
            >
              Complete step
            </button>
          ) : null}
          {current.type === "agent" && current.status === "awaiting_approval" ? (
            <>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => advanceRun(run.id, "approve_agent")}
              >
                Approve & continue
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => advanceRun(run.id, "reject_agent")}
              >
                Regenerate draft
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="btn--quinary type-sm"
            onClick={() => cancelRun(run.id)}
          >
            Cancel run
          </button>
        </div>
      ) : null}
    </div>
  );
}
