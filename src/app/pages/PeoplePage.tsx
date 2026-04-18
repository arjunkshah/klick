import { Mail, Plus, Users } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import type { TeamMember } from "../../data/types";
import { useKlickStore } from "../../data/store";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

function Presence({ presence }: { presence: TeamMember["presence"] }) {
  const label =
    presence === "active" ? "Active" : presence === "away" ? "Away" : "Offline";
  return (
    <span className={`people-presence people-presence--${presence}`} title={label} aria-label={label} />
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="people-card">
      <div className="people-card__top">
        <span className="people-card__avatar" aria-hidden>
          {initialsOf(member.name)}
        </span>
        <Presence presence={member.presence} />
      </div>
      <h2 className="people-card__name">{member.name}</h2>
      <p className="people-card__title">{member.title}</p>
      <p className="people-card__email">
        <Mail className="people-card__email-icon" size={13} strokeWidth={1.75} aria-hidden />
        <span className="people-card__email-text">{member.email || "—"}</span>
      </p>
      <span className={`people-card__role people-card__role--${member.role}`}>{member.role}</span>
    </article>
  );
}

export function PeoplePage() {
  const workspace = useKlickStore((s) => s.workspace);
  const members = useKlickStore((s) => s.members);
  const addMember = useKlickStore((s) => s.addMember);

  const sorted = useMemo(
    () =>
      [...members].sort((a, b) => {
        const rank = (r: TeamMember["role"]) =>
          r === "owner" ? 0 : r === "admin" ? 1 : 2;
        const dr = rank(a.role) - rank(b.role);
        if (dr !== 0) return dr;
        return a.name.localeCompare(b.name);
      }),
    [members],
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("member");
  const [inviteOpen, setInviteOpen] = useState(false);

  const submitInvite = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const n = name.trim();
      const em = email.trim();
      if (!n || !em) return;
      addMember(n, em, role);
      setName("");
      setEmail("");
      setRole("member");
      setInviteOpen(false);
    },
    [addMember, name, email, role],
  );

  return (
    <div className="app-page app-page--people people-page">
      <header className="people-page__intro">
        <div className="people-page__intro-row">
          <div className="people-page__intro-icon" aria-hidden>
            <Users size={22} strokeWidth={1.65} />
          </div>
          <div>
            <p className="people-page__eyebrow">{workspace.name}</p>
            <h1 className="people-page__title">People</h1>
            <p className="people-page__lede">
              Everyone with access to this workspace—roles, titles, and presence at a glance.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="people-invite-toggle"
          onClick={() => setInviteOpen((v) => !v)}
          aria-expanded={inviteOpen}
        >
          <Plus size={16} strokeWidth={1.65} aria-hidden />
          {inviteOpen ? "Close invite" : "Add teammate"}
        </button>
      </header>

      {inviteOpen ? (
        <form className="people-invite" onSubmit={submitInvite}>
          <div className="people-invite__fields">
            <label className="people-invite__field">
              <span className="people-invite__label">Name</span>
              <input
                className="people-invite__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jamie Chen"
                autoComplete="name"
                required
              />
            </label>
            <label className="people-invite__field">
              <span className="people-invite__label">Email</span>
              <input
                className="people-invite__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jamie@company.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="people-invite__field people-invite__field--role">
              <span className="people-invite__label">Role</span>
              <select
                className="people-invite__select"
                value={role}
                onChange={(e) => setRole(e.target.value as TeamMember["role"])}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </label>
          </div>
          <div className="people-invite__actions">
            <button type="submit" className="people-invite__submit">
              Add to workspace
            </button>
            <p className="people-invite__hint">Invite is stored in your workspace document (Firestore).</p>
          </div>
        </form>
      ) : null}

      <div className="people-page__body thin-scrollbar">
        {sorted.length === 0 ? (
          <div className="people-empty">
            <p>No people in this workspace yet.</p>
            <button type="button" className="people-invite-toggle" onClick={() => setInviteOpen(true)}>
              <Plus size={16} strokeWidth={1.65} aria-hidden />
              Add someone
            </button>
          </div>
        ) : (
          <ul className="people-grid">
            {sorted.map((m) => (
              <li key={m.id}>
                <MemberCard member={m} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
