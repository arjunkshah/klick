import { useKlickStore } from "../data/store";

/** Serializes local workspace data so Dex can search and reason over it (truncated for context limits). */
export function buildDexWorkspaceContext(maxChars = 72_000): string {
  const s = useKlickStore.getState();
  const memberName = new Map(s.members.map((m) => [m.id, m.name]));
  const channelName = new Map(s.channels.map((c) => [c.id, c.name]));

  const lines: string[] = [];
  lines.push(`# Workspace snapshot`);
  lines.push(`Name: ${s.workspace.name}`);
  lines.push(`Profile: ${s.profile.displayName} <${s.profile.email}>`);
  lines.push(`Slack connected (demo flag): ${s.workspace.slackConnected}`);
  lines.push("");

  lines.push("## Projects");
  for (const p of s.projects) {
    lines.push(`- **${p.id}** ${p.name} [${p.status}] — ${p.description}`);
    for (const m of p.milestones) {
      lines.push(
        `  - Milestone: ${m.name} done=${m.done} due=${m.dueDate ?? "—"}`,
      );
    }
  }
  lines.push("");

  lines.push("## Issues");
  for (const i of s.issues) {
    lines.push(
      `- **${i.id}** [${i.state}] ${i.title} · project \`${i.projectId}\` · priority ${i.priority} · cycle ${i.cycle ?? "—"}`,
    );
    if (i.labels.length) lines.push(`  labels: ${i.labels.join(", ")}`);
    if (i.blockedByIssueIds.length) {
      lines.push(`  blockedBy: ${i.blockedByIssueIds.join(", ")}`);
    }
    if (i.description) {
      lines.push(`  description: ${clamp(i.description, 1200)}`);
    }
    if (i.comments.length) {
      lines.push("  comments:");
      for (const c of i.comments.slice(-10)) {
        const tag = c.agent ? " (agent)" : "";
        lines.push(`    - ${c.author}${tag}: ${clamp(c.body, 500)}`);
      }
    }
  }
  lines.push("");

  lines.push("## Doc folders");
  for (const f of s.docFolders) {
    lines.push(
      `- **${f.id}** ${f.icon} ${f.name} · parent ${f.parentFolderId ?? "∅"}`,
    );
  }
  lines.push("");

  lines.push("## Docs");
  for (const d of s.docs) {
    lines.push(
      `- **${d.id}** ${d.title} · folder \`${d.folderId ?? "∅"}\` · parentPage \`${d.parentId ?? "∅"}\``,
    );
    if (d.linkedIssueIds.length) {
      lines.push(`  linkedIssues: ${d.linkedIssueIds.join(", ")}`);
    }
    if (d.content) {
      lines.push(`  body:\n${indent(clamp(d.content, 3500), "    ")}`);
    }
  }
  lines.push("");

  lines.push("## Channels");
  for (const ch of s.channels) {
    lines.push(
      `- **${ch.id}** #${ch.name} (${ch.type}) · ${ch.topic} · project \`${ch.projectId ?? "—"}\``,
    );
  }
  lines.push("");

  lines.push("## Messages (newest first, truncated)");
  const sorted = [...s.messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  for (const m of sorted.slice(0, 100)) {
    const ch = channelName.get(m.channelId) ?? m.channelId;
    const who = memberName.get(m.authorId) ?? m.authorId;
    const thread = m.parentId ? ` (reply→${m.parentId})` : "";
    const agent = m.agent ? " [agent]" : "";
    lines.push(
      `- #${ch} ${who}${agent}${thread}: ${clamp(m.body, 480)}`,
    );
  }
  lines.push("");

  lines.push("## Tasks");
  for (const t of s.tasks) {
    lines.push(
      `- **${t.id}** ${t.done ? "[x]" : "[ ]"} ${t.title} · issue \`${t.issueId ?? "—"}\` · project \`${t.projectId ?? "—"}\``,
    );
  }
  lines.push("");

  lines.push("## Playbooks");
  for (const p of s.playbooks) {
    lines.push(`- **${p.id}** ${p.name} — ${p.description}`);
    for (const st of p.steps) {
      lines.push(`  - (${st.type}) ${st.title}: ${clamp(st.description, 200)}`);
    }
  }
  lines.push("");

  lines.push("## Runs (summary)");
  for (const r of s.runs.slice(0, 20)) {
    lines.push(
      `- **${r.id}** ${r.playbookName} [${r.status}] started ${r.startedAt}`,
    );
  }
  lines.push("");

  lines.push("## Inbox");
  for (const n of s.inbox.slice(0, 25)) {
    lines.push(`- [${n.type}] ${n.title}: ${clamp(n.body, 280)}`);
  }
  lines.push("");

  lines.push("## People");
  for (const m of s.members) {
    lines.push(
      `- **${m.id}** ${m.name} <${m.email}> · ${m.title} · ${m.role} · ${m.presence}`,
    );
  }

  let out = lines.join("\n");
  if (out.length > maxChars) {
    out = out.slice(0, maxChars) + "\n\n[…snapshot truncated for context size]";
  }
  return out;
}

function clamp(s: string, n: number): string {
  if (s.length <= n) return s;
  return `${s.slice(0, n)}…`;
}

function indent(s: string, prefix: string): string {
  return s
    .split("\n")
    .map((line) => prefix + line)
    .join("\n");
}
