import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { DexPage } from "./app/pages/DexPage";
import { DocsPage } from "./app/pages/DocsPage";
import { IntegrationsPage } from "./app/pages/IntegrationsPage";
import { OnboardingPage } from "./app/pages/OnboardingPage";
import { InboxPage } from "./app/pages/InboxPage";
import { PeoplePage } from "./app/pages/PeoplePage";
import { PlaybooksPage } from "./app/pages/PlaybooksPage";
import { IssuesPage } from "./app/pages/IssuesPage";
import { ProjectsPage } from "./app/pages/ProjectsPage";
import { RunsPage } from "./app/pages/RunsPage";
import { SettingsPage } from "./app/pages/SettingsPage";
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
          <Route path="playbooks" element={<PlaybooksPage />} />
          <Route path="runs" element={<RunsPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
