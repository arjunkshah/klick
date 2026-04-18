import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { AppPlaceholderPage } from "./app/pages/AppPlaceholderPage";
import { DocsPage } from "./app/pages/DocsPage";
import { DexPage } from "./app/pages/DexPage";
import { PeoplePage } from "./app/pages/PeoplePage";
import { InboxPage } from "./app/pages/InboxPage";
import { IssuesPage } from "./app/pages/IssuesPage";
import { ProjectsPage } from "./app/pages/ProjectsPage";
import { TasksPage } from "./app/pages/TasksPage";
import { ThreadsPage } from "./app/pages/ThreadsPage";
import { TodayPage } from "./app/pages/TodayPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { PageTransition } from "./components/PageTransition";
import { LandingPage } from "./LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/signup"
          element={
            <PageTransition>
              <SignupPage />
            </PageTransition>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TodayPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="threads" element={<ThreadsPage />} />
          <Route path="issues" element={<IssuesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="dex" element={<DexPage />} />
          <Route path="playbooks" element={<AppPlaceholderPage title="Playbooks" />} />
          <Route path="runs" element={<AppPlaceholderPage title="Runs" />} />
          <Route path="integrations" element={<AppPlaceholderPage title="Integrations" />} />
          <Route path="settings" element={<AppPlaceholderPage title="Settings" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
