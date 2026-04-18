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
  const ghErr = req.query?.error;

  if (ghErr) {
    go(`?github_error=${encodeURIComponent(String(ghErr))}`);
    return;
  }

  const uid = verifyOAuthState(typeof state === "string" ? state : "");
  if (!code || !uid) {
    go("?github_error=invalid_state");
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    go("?github_error=missing_config");
    return;
  }

  const redirectUri = `${origin}/api/integrations/github/callback`;

  let tokenRes;
  try {
    tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });
  } catch {
    go("?github_error=token_fetch");
    return;
  }

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    go(`?github_error=${encodeURIComponent(String(tokenJson.error || "oauth_failed"))}`);
    return;
  }

  let login = "";
  let scope = typeof tokenJson.scope === "string" ? tokenJson.scope : "";
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (userRes.ok) {
      const u = await userRes.json();
      login = typeof u.login === "string" ? u.login : "";
    }
  } catch {
    /* still store token */
  }

  try {
    const db = adminDb();
    await db.doc(`users/${uid}/klick/privateIntegrations`).set(
      {
        github: {
          accessToken,
          login,
          scope,
          connectedAt: new Date().toISOString(),
        },
      },
      { merge: true },
    );
    await db.doc(`users/${uid}/klick/state`).set(
      {
        workspace: {
          githubConnected: true,
        },
      },
      { merge: true },
    );
  } catch {
    go("?github_error=firestore");
    return;
  }

  go("?github=connected");
}
