import { useKlickStore } from "../../data/store";
import type { MemberPresence } from "../../data/types";

const presenceLabel: Record<MemberPresence, string> = {
  active: "Active",
  away: "Away",
  offline: "Offline",
};

const presenceDot: Record<MemberPresence, string> = {
  active: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-theme-text-tertiary",
};

export function PeoplePage() {
  const members = useKlickStore((s) => s.members);
  const setMemberPresence = useKlickStore((s) => s.setMemberPresence);

  return (
    <div className="mx-auto max-w-[960px] px-g2 py-v2">
      <div className="mb-v2 border-b border-theme-border-01 pb-v2">
        <h1 className="type-md mb-v1">People</h1>
        <p className="type-sm text-theme-text-sec">
          Directory and presence—Slack-shaped awareness without leaving Klick.
        </p>
      </div>
      <div className="grid gap-g1 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <div key={m.id} className="card card--large !p-g1.5">
            <div className="flex items-start gap-g1">
              <div className="avatar-border-container flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-card-03-hex type-sm font-medium">
                {m.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="type-base font-medium truncate">{m.name}</span>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${presenceDot[m.presence]}`}
                    title={presenceLabel[m.presence]}
                  />
                </div>
                <div className="type-product-sm text-theme-text-tertiary">{m.title}</div>
                <div className="type-sm mt-1 truncate text-theme-text-sec">{m.email}</div>
                <div className="type-product-sm mt-1 capitalize text-theme-text-mid">{m.role}</div>
                {m.id === "u1" ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(["active", "away", "offline"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`btn btn--sm ${m.presence === p ? "" : "btn--secondary"}`}
                        onClick={() => setMemberPresence(m.id, p)}
                      >
                        {presenceLabel[p]}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
