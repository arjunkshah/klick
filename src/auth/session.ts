const AUTH_KEY = "klick-auth";

export type KlickSession = {
  email: string;
  displayName: string;
  workspaceName: string;
};

export function getSession(): KlickSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as KlickSession;
    if (!s?.email) return null;
    return s;
  } catch {
    return null;
  }
}

export function setSession(s: KlickSession) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(s));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}
