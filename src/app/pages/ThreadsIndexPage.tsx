import { Navigate } from "react-router-dom";
import { useKlickStore } from "../../data/store";

export function ThreadsIndexPage() {
  const first = useKlickStore((s) => s.channels[0]?.id);
  if (!first) {
    return (
      <div className="flex h-full items-center justify-center p-g2">
        <div className="card card--large max-w-md !p-g2 text-center">
          <h1 className="type-base mb-v1">No channels yet</h1>
          <p className="type-sm text-theme-text-sec">
            Create one from the sidebar to start a Slack-style thread.
          </p>
        </div>
      </div>
    );
  }
  return <Navigate to={first} replace />;
}
