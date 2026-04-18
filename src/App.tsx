import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { DocsLayout } from "./app/layout/DocsLayout";
import { ThreadsLayout } from "./app/layout/ThreadsLayout";
import { ChannelPage } from "./app/pages/ChannelPage";
import { DocDetailPage } from "./app/pages/DocDetailPage";
import { DocsHomePage } from "./app/pages/DocsHomePage";
import { InboxPage } from "./app/pages/InboxPage";
import { IntegrationsPage } from "./app/pages/IntegrationsPage";
import { IssueDetailPage } from "./app/pages/IssueDetailPage";
import { IssuesPage } from "./app/pages/IssuesPage";
import { PeoplePage } from "./app/pages/PeoplePage";
import { PlaybookDetailPage } from "./app/pages/PlaybookDetailPage";
import { PlaybooksPage } from "./app/pages/PlaybooksPage";
import { ProjectsPage } from "./app/pages/ProjectsPage";
import { RunDetailPage } from "./app/pages/RunDetailPage";
import { RunsPage } from "./app/pages/RunsPage";
import { TasksPage } from "./app/pages/TasksPage";
import { ThreadsIndexPage } from "./app/pages/ThreadsIndexPage";
import { DexPage } from "./app/pages/DexPage";
import { TodayPage } from "./app/pages/TodayPage";
import { SecuritySettingsPage } from "./app/pages/settings/SecuritySettingsPage";
import { SettingsHomePage } from "./app/pages/settings/SettingsHomePage";
import { TeamSettingsPage } from "./app/pages/settings/TeamSettingsPage";
import { WorkspaceSettingsPage } from "./app/pages/settings/WorkspaceSettingsPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LandingPage } from "./LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
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
        <Route path="threads" element={<ThreadsLayout />}>
          <Route index element={<ThreadsIndexPage />} />
          <Route path=":channelId" element={<ChannelPage />} />
        </Route>
        <Route path="issues" element={<IssuesPage />} />
        <Route path="issues/:issueId" element={<IssueDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="docs" element={<DocsLayout />}>
          <Route index element={<DocsHomePage />} />
          <Route path=":docId" element={<DocDetailPage />} />
        </Route>
        <Route path="people" element={<PeoplePage />} />
        <Route path="dex" element={<DexPage />} />
        <Route path="playbooks" element={<PlaybooksPage />} />
        <Route path="playbooks/:playbookId" element={<PlaybookDetailPage />} />
        <Route path="runs" element={<RunsPage />} />
        <Route path="runs/:runId" element={<RunDetailPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="settings" element={<SettingsHomePage />} />
        <Route path="settings/workspace" element={<WorkspaceSettingsPage />} />
        <Route path="settings/team" element={<TeamSettingsPage />} />
        <Route path="settings/security" element={<SecuritySettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
