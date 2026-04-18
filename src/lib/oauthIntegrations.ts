/**
 * Start server-side OAuth (Slack / GitHub). Requires deployed API routes + env vars.
 */
export async function startSlackOAuth(getIdToken: () => Promise<string>): Promise<void> {
  const idToken = await getIdToken();
  const r = await fetch("/api/integrations/slack/start", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!r.ok) {
    throw new Error(j.error || `Slack OAuth failed (${r.status})`);
  }
  if (!j.url) throw new Error("No authorize URL returned");
  window.location.assign(j.url);
}

export async function startGitHubOAuth(getIdToken: () => Promise<string>): Promise<void> {
  const idToken = await getIdToken();
  const r = await fetch("/api/integrations/github/start", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!r.ok) {
    throw new Error(j.error || `GitHub OAuth failed (${r.status})`);
  }
  if (!j.url) throw new Error("No authorize URL returned");
  window.location.assign(j.url);
}
