/** Call Slack Web API with a bot token from OAuth. */
export async function slackAuthTest(accessToken: string): Promise<{ ok: boolean; team?: string; user?: string }> {
  const r = await fetch("https://slack.com/api/auth.test", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const j = (await r.json()) as { ok?: boolean; team?: string; user?: string; error?: string };
  if (!j.ok) {
    throw new Error(j.error || "Slack auth.test failed");
  }
  return { ok: true, team: j.team, user: j.user };
}
