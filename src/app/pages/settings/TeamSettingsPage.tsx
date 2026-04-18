import { useState } from "react";
import { Link } from "react-router-dom";
import { useKlickStore } from "../../../data/store";
import type { TeamMember } from "../../../data/types";

export function TeamSettingsPage() {
  const members = useKlickStore((s) => s.members);
  const addMember = useKlickStore((s) => s.addMember);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("member");

  return (
    <div className="mx-auto max-w-prose-medium-wide">
      <Link to="/app/settings" className="type-sm text-theme-text-sec hover:text-theme-text">
        ← Settings
      </Link>
      <h1 className="type-md mt-v1 mb-v2">Team & roles</h1>

      <form
        className="card !p-g1.5 mb-v2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !email.trim()) return;
          addMember(name.trim(), email.trim(), role, title.trim() || "Member");
          setName("");
          setEmail("");
          setTitle("");
        }}
      >
        <div className="type-sm font-medium mb-2">Invite member</div>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            className="type-base flex-1 rounded-xs border border-theme-border-02 bg-theme-bg px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="type-base flex-1 rounded-xs border border-theme-border-02 bg-theme-bg px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <input
            className="type-base min-w-[140px] flex-1 rounded-xs border border-theme-border-02 bg-theme-bg px-3 py-2"
            placeholder="Role title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="type-base rounded-xs border border-theme-border-02 bg-theme-bg px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as TeamMember["role"])}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <button type="submit" className="btn btn--sm mt-2">
          Add
        </button>
      </form>

      <ul className="space-y-1">
        {members.map((m) => (
          <li key={m.id} className="type-sm flex flex-wrap justify-between gap-2 border-b border-theme-border-02 py-2">
            <span className="font-medium">{m.name}</span>
            <span className="text-theme-text-sec">{m.email}</span>
            <span className="text-theme-text-mid">
              {m.title} · <span className="capitalize">{m.role}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
