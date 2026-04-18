import type { Issue } from "../data/types";

export type DexContext = {
  workspaceName: string;
  slackConnected: boolean;
  activeIssueCount: number;
  blockedCount: number;
  inboxUnread: number;
  agentInboxUnread: number;
  assignedToYouCount: number;
  runningRuns: number;
  urgentOpenCount: number;
  highOpenCount: number;
  docCount: number;
};

export function snapshotDexContext(input: {
  workspace: { name: string; slackConnected: boolean };
  issues: Issue[];
  inbox: { read: boolean; type: string }[];
  runs: { status: string }[];
  profile: { email: string };
  members: { id: string; email: string }[];
  docs: unknown[];
}): DexContext {
  const active = input.issues.filter((i) => i.state !== "done" && i.state !== "canceled");
  const youId =
    input.members.find((m) => m.email === input.profile.email)?.id ??
    input.members[0]?.id ??
    "";
  const blocked = active.filter((i) => i.blockedByIssueIds.length > 0);
  const unread = input.inbox.filter((n) => !n.read);
  const agentUnread = unread.filter((n) => n.type === "agent_proposal");

  return {
    workspaceName: input.workspace.name,
    slackConnected: input.workspace.slackConnected,
    activeIssueCount: active.length,
    blockedCount: blocked.length,
    inboxUnread: unread.length,
    agentInboxUnread: agentUnread.length,
    assignedToYouCount: active.filter((i) => i.assigneeId === youId).length,
    runningRuns: input.runs.filter((r) => r.status === "running").length,
    urgentOpenCount: active.filter((i) => i.priority === "urgent").length,
    highOpenCount: active.filter((i) => i.priority === "high").length,
    docCount: input.docs.length,
  };
}

export function buildDexReply(userText: string, ctx: DexContext): string {
  const t = userText.toLowerCase().trim();

  if (t.includes("block") || t.includes("blocked") || t.includes("dependency")) {
    if (ctx.blockedCount === 0) {
      return "Nothing is blocked on dependencies right now—nice. If something stalls, link the blocking issue so I can track it.";
    }
    return `${ctx.blockedCount} active issue${ctx.blockedCount === 1 ? "" : "s"} ${ctx.blockedCount === 1 ? "is" : "are"} waiting on upstream work. Open **Issues** and sort by blockers, or ask me for **summarize today** for the full pulse.`;
  }

  if (
    t.includes("inbox") ||
    t.includes("triage") ||
    t.includes("notification") ||
    t.includes("mention")
  ) {
    if (ctx.inboxUnread === 0) {
      return "Inbox is clear—no unread mentions, Slack mirrors, or agent proposals.";
    }
    const agent =
      ctx.agentInboxUnread > 0
        ? ` ${ctx.agentInboxUnread} ${ctx.agentInboxUnread === 1 ? "is" : "are"} agent proposals needing approval.`
        : "";
    return `${ctx.inboxUnread} unread inbox item${ctx.inboxUnread === 1 ? "" : "s"}.${agent} Triage there first for the tightest feedback loop.`;
  }

  if (
    t.includes("summarize") ||
    t.includes("summary") ||
    t.includes("today") ||
    t.includes("pulse") ||
    t.includes("digest")
  ) {
    const parts: string[] = [];
    parts.push(
      `${ctx.workspaceName}: **${ctx.activeIssueCount}** open issues, **${ctx.docCount}** docs.`,
    );
    if (ctx.urgentOpenCount > 0) {
      parts.push(`**${ctx.urgentOpenCount}** urgent still open—clear those before deep work.`);
    } else if (ctx.highOpenCount > 0) {
      parts.push(`**${ctx.highOpenCount}** high-priority issue${ctx.highOpenCount === 1 ? "" : "s"} in flight.`);
    }
    if (ctx.blockedCount > 0) {
      parts.push(`**${ctx.blockedCount}** blocked on dependencies.`);
    }
    if (ctx.inboxUnread > 0) {
      parts.push(`**${ctx.inboxUnread}** inbox unread${ctx.agentInboxUnread ? ` (${ctx.agentInboxUnread} agent)` : ""}.`);
    }
    if (ctx.assignedToYouCount > 0) {
      parts.push(`**${ctx.assignedToYouCount}** on you—start with the smallest unblock.`);
    }
    if (ctx.runningRuns > 0) {
      parts.push(`**${ctx.runningRuns}** playbook run${ctx.runningRuns === 1 ? "" : "s"} live—check **Runs** for approvals.`);
    }
    if (!ctx.slackConnected) {
      parts.push("Slack isn’t connected yet—wire it under **Integrations** for real-time mirrors.");
    }
    if (parts.length === 1) {
      parts.push("Workspace looks steady; I’ll flag spikes here as they happen.");
    }
    return parts.join(" ");
  }

  if (t.includes("urgent") || t.includes("priority") || t.includes("p0") || t.includes("p1")) {
    if (ctx.urgentOpenCount === 0 && ctx.highOpenCount === 0) {
      return "No urgent or high-priority issues in the open queue—good time to burn down medium/low or prep the next cycle.";
    }
    return `Open queue: **${ctx.urgentOpenCount}** urgent, **${ctx.highOpenCount}** high. I’d sequence urgent first, then unblock anything with dependencies.`;
  }

  if (t.includes("run") && (t.includes("playbook") || t.includes("approval"))) {
    if (ctx.runningRuns === 0) {
      return "No playbook runs are in flight. Start one from **Playbooks**—I’ll mirror approvals in Inbox when agents need a human.";
    }
    return `${ctx.runningRuns} run${ctx.runningRuns === 1 ? "" : "s"} active. Watch **Runs** and Inbox for approval steps so nothing stalls.`;
  }

  if (t.includes("slack") || t.includes("integration")) {
    if (ctx.slackConnected) {
      return "Slack is connected—mirrors and notifications should flow into Inbox. If something’s missing, check channel mapping in **Integrations**.";
    }
    return "Slack isn’t connected for this workspace yet. Open **Integrations**, complete OAuth, and I can summarize thread activity alongside Klick-native work.";
  }

  if (t.includes("help") || t.includes("what can you")) {
    return "Try **summarize today**, **what’s blocked**, **inbox**, **urgent issues**, or **playbook runs**. I use the same live workspace data as your Today page.";
  }

  return `In **${ctx.workspaceName}** I see **${ctx.activeIssueCount}** open issues, **${ctx.inboxUnread}** inbox unread, **${ctx.blockedCount}** blocked, **${ctx.assignedToYouCount}** assigned to you. Say **summarize today** for a full pulse, or ask about blockers, inbox, or runs.`;
}
