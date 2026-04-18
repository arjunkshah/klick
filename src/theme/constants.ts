export const THEME_STORAGE_KEY = "klick-theme";

export type Theme = "light" | "dark";

export function getResolvedTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const k = localStorage.getItem(THEME_STORAGE_KEY);
  if (k === "dark" || k === "light") return k;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
