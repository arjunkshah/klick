/** Rail UI icons */
const stroke = "currentColor";
const sw = 1.5;

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
