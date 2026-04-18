export function AgentBadge({ compact }: { compact?: boolean }) {
  return (
    <span
      className={`agent-surface font-mono text-[0.65rem] font-normal uppercase tracking-wide text-theme-accent ${
        compact ? "px-1 py-0" : "px-1.5 py-0.5"
      }`}
    >
      Agent
    </span>
  );
}
