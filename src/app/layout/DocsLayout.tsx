import { Outlet } from "react-router-dom";
import { DocsSidebar } from "../components/DocsSidebar";

export function DocsLayout() {
  return (
    <div className="flex h-full min-h-0">
      <DocsSidebar />
      <div className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
