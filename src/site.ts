/** Base URL for marketing links (update when the product domain is live). */
export const SITE_ORIGIN = "https://klick.app";

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}`;
}
