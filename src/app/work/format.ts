import type { IssueState, Priority } from "../../data/types";

export function issueRef(issueId: string): string {
  const n = issueId.replace(/\D/g, "") || "0";
  return `KLK-${n}`;
}

export function formatIssueState(state: IssueState): string {
  const labels: Record<IssueState, string> = {
    backlog: "Backlog",
    todo: "Todo",
    in_progress: "In progress",
    done: "Done",
    canceled: "Canceled",
  };
  return labels[state];
}

export function priorityOrder(p: Priority): number {
  const o: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  return o[p];
}
