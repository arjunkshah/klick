import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const s = process.env.INTEGRATION_OAUTH_SECRET?.trim();
  if (!s || s.length < 16) {
    throw new Error("INTEGRATION_OAUTH_SECRET must be set (min 16 chars).");
  }
  return s;
}

/** Signed payload: uid:expMs */
export function signOAuthState(uid) {
  const exp = Date.now() + 12 * 60 * 1000;
  const payload = `${uid}:${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}

export function verifyOAuthState(state) {
  if (!state || typeof state !== "string") return null;
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const b64 = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  let payload;
  try {
    payload = Buffer.from(b64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    if (expected.length !== sig.length) return null;
    if (!timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(sig, "utf8"))) return null;
  } catch {
    return null;
  }
  const colon = payload.indexOf(":");
  if (colon <= 0) return null;
  const uid = payload.slice(0, colon);
  const exp = Number(payload.slice(colon + 1));
  if (!uid || !Number.isFinite(exp) || Date.now() > exp) return null;
  return uid;
}
