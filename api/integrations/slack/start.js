import { getAppOrigin } from "../../_lib/appOrigin.js";
import { signOAuthState } from "../../_lib/oauthState.js";
import { verifyBearerUid } from "../../_lib/verifyBearerUid.js";

/** Bot scopes — configure the same in your Slack app OAuth & Permissions page. */
const SLACK_SCOPE = "channels:read,chat:write,users:read,team:read";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientId = process.env.SLACK_CLIENT_ID?.trim();
  if (!clientId) {
    res.status(503).json({ error: "Slack is not configured (SLACK_CLIENT_ID)." });
    return;
  }

  const uid = await verifyBearerUid(req);
  if (!uid) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let state;
  try {
    state = signOAuthState(uid);
  } catch (e) {
    res.status(503).json({ error: e instanceof Error ? e.message : "OAuth not configured" });
    return;
  }

  const origin = getAppOrigin();
  const redirectUri = `${origin}/api/integrations/slack/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    scope: SLACK_SCOPE,
    redirect_uri: redirectUri,
    state,
    tracked: "1",
  });
  const url = `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  res.status(200).json({ url });
}
