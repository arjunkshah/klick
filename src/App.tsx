import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { AppPlaceholderPage } from "./app/pages/AppPlaceholderPage";
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
        <Route index element={<AppPlaceholderPage title="Today" />} />
        <Route path="inbox" element={<AppPlaceholderPage title="Inbox" />} />
        <Route path="threads" element={<AppPlaceholderPage title="Threads" />} />
        <Route path="issues" element={<AppPlaceholderPage title="Issues" />} />
        <Route path="tasks" element={<AppPlaceholderPage title="Tasks" />} />
        <Route path="projects" element={<AppPlaceholderPage title="Projects" />} />
        <Route path="docs" element={<AppPlaceholderPage title="Docs" />} />
        <Route path="people" element={<AppPlaceholderPage title="People" />} />
        <Route path="dex" element={<AppPlaceholderPage title="Dex" />} />
        <Route path="playbooks" element={<AppPlaceholderPage title="Playbooks" />} />
        <Route path="runs" element={<AppPlaceholderPage title="Runs" />} />
        <Route path="integrations" element={<AppPlaceholderPage title="Integrations" />} />
        <Route path="settings" element={<AppPlaceholderPage title="Settings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
