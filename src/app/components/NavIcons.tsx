/** Minimal 20×20 stroke icons for the app rail (matches marketing weight). */
const stroke = "currentColor";
const sw = 1.5;

export function IconToday() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="6.5" stroke={stroke} strokeWidth={sw} />
      <path d="M10 6.5v3.25L12.25 12" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function IconInbox() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.5 6.5h13v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path d="M3.5 6.5 7 3.5h6l3.5 3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function IconThreads() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5.5 6.5h9M5.5 10h9M5.5 13.5h6"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconIssues() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="6.5" stroke={stroke} strokeWidth={sw} />
      <circle cx="10" cy="10" r="2" fill={stroke} />
    </svg>
  );
}

export function IconTasks() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.5 6.5h8M6.5 10h6M6.5 13.5h8"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <path
        d="M4 6.5h.01M4 10h.01M4 13.5h.01"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconProjects() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4.5 6.5h11v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path d="M7.5 6.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5" stroke={stroke} strokeWidth={sw} />
    </svg>
  );
}

export function IconDocs() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M12.5 3.5H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6.5l-3-3Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path d="M12.5 3.5v3H15.5" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
}

export function IconPeople() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="7" cy="6.5" r="2.25" stroke={stroke} strokeWidth={sw} />
      <path
        d="M3.5 15.25v-.5a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v.5"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <circle cx="14" cy="7" r="2" stroke={stroke} strokeWidth={sw} />
      <path
        d="M17 15.5v-.25a2.5 2.5 0 0 0-2.5-2.5h-.5"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconDex() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 3.5 12.5 8l5 .5-3.75 3.75L15 17.5 10 15l-5 2.5.25-5.25L1.5 8.5 6.5 8 10 3.5Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPlaybooks() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6.5 5.5h8M6.5 10h8M6.5 14.5h5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <path
        d="M4 4.5v11a1 1 0 0 0 1 1h10"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconRuns() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.5 4.75v10.5l9-5.25-9-5.25Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconIntegrations() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7.5 4.5v3M12.5 4.5v3M7.5 12.5v3M12.5 12.5v3M4.5 7.5h3M12.5 7.5h3M4.5 12.5h3M12.5 12.5h3"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <rect x="7.5" y="7.5" width="5" height="5" rx="1" stroke={stroke} strokeWidth={sw} />
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="2.25" stroke={stroke} strokeWidth={sw} />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconChevronRail({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={`transition-transform duration-[var(--duration)] ease-[var(--ease-out-spring)] ${collapsed ? "rotate-180" : ""}`}
    >
      <path
        d="M12.5 5.5 7.5 10l5 4.5"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
