export type GitHubUserInfo = { login: string; name: string | null; avatarUrl: string | null };

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUserInfo> {
  const r = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t.slice(0, 200) || `GitHub HTTP ${r.status}`);
  }
  const u = (await r.json()) as { login?: string; name?: string | null; avatar_url?: string | null };
  return {
    login: String(u.login ?? ""),
    name: u.name ?? null,
    avatarUrl: u.avatar_url ?? null,
  };
}
