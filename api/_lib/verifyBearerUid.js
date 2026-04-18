import { adminAuth } from "./firebaseAdmin.js";

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string | null>}
 */
export async function verifyBearerUid(req) {
  const raw =
    (typeof req.headers?.authorization === "string" && req.headers.authorization) ||
    (typeof req.headers?.Authorization === "string" && req.headers.Authorization) ||
    "";
  const m = raw.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1]?.trim();
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
