/** Public app URL for OAuth redirects (no trailing slash). */
export function getAppOrigin() {
  const explicit = process.env.APP_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:5173";
}
