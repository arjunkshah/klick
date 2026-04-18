import { getAppOrigin } from "../../_lib/appOrigin.js";
import { adminDb } from "../../_lib/firebaseAdmin.js";
import { verifyOAuthState } from "../../_lib/oauthState.js";

export default async function handler(req, res) {
  const origin = getAppOrigin();
  const go = (search) => {
    res.status(302).setHeader("Location", `${origin}/app/integrations${search}`).end();
  };

  const code = req.query?.code;
  const state = req.query?.state;
  const slackErr = req.query?.error;

  if (slackErr) {
    go(`?slack_error=${encodeURIComponent(String(slackErr))}`);
    return;
  }

  const uid = verifyOAuthState(typeof state === "string" ? state : "");
  if (!code || !uid) {
    go("?slack_error=invalid_state");
    return;
  }

  const clientId = process.env.SLACK_CLIENT_ID?.trim();
  const clientSecret = process.env.SLACK_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    go("?slack_error=missing_config");
    return;
  }

  const redirectUri = `${origin}/api/integrations/slack/callback`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: String(code),
    redirect_uri: redirectUri,
  });

  let tokenRes;
  try {
    tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch {
    go("?slack_error=token_fetch");
    return;
  }

  const tokenJson = await tokenRes.json();
  if (!tokenJson.ok || !tokenJson.access_token) {
    go(`?slack_error=${encodeURIComponent(String(tokenJson.error || "oauth_failed"))}`);
    return;
  }

  const teamId = tokenJson.team?.id ?? "";
  const teamName = tokenJson.team?.name ?? "";

  try {
    const db = adminDb();
    await db.doc(`users/${uid}/klick/privateIntegrations`).set(
      {
        slack: {
          accessToken: tokenJson.access_token,
          teamId,
          teamName,
          scope: typeof tokenJson.scope === "string" ? tokenJson.scope : "",
          connectedAt: new Date().toISOString(),
        },
      },
      { merge: true },
    );
    await db.doc(`users/${uid}/klick/state`).set(
      {
        workspace: {
          slackConnected: true,
          slackWorkspace: teamName || teamId || undefined,
        },
      },
      { merge: true },
    );
  } catch {
    go("?slack_error=firestore");
    return;
  }

  go("?slack=connected");
}
