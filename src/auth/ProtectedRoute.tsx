import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const { status, user, configured } = useAuth();

  if (!configured) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center type-base text-theme-text-sec">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}
