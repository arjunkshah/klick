import { useTheme } from "../theme/useTheme";

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z" />
    </svg>
  );
}

type Props = {
  className?: string;
  /** Single control that cycles theme — for narrow / collapsed rails */
  compact?: boolean;
};

/** Linear / Notion–style light–dark control: sun & moon in a pill with a sliding thumb. */
export function ThemeAppearanceToggle({ className = "", compact = false }: Props) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        className={`theme-appearance-compact ${className}`.trim()}
        aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}
        title={theme === "light" ? "Dark mode" : "Light mode"}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? <IconMoon className="theme-appearance-compact__icon" /> : <IconSun className="theme-appearance-compact__icon" />}
      </button>
    );
  }

  return (
    <div
      className={`theme-appearance-pill ${className}`.trim()}
      role="group"
      aria-label="Color theme"
    >
      <div className="theme-appearance-pill__track" data-theme={theme}>
        <span className="theme-appearance-pill__thumb" aria-hidden />
        <button
          type="button"
          className="theme-appearance-pill__btn"
          aria-pressed={theme === "light"}
          aria-label="Light theme"
          title="Light"
          onClick={() => setTheme("light")}
        >
          <IconSun className="theme-appearance-pill__icon" />
        </button>
        <button
          type="button"
          className="theme-appearance-pill__btn"
          aria-pressed={theme === "dark"}
          aria-label="Dark theme"
          title="Dark"
          onClick={() => setTheme("dark")}
        >
          <IconMoon className="theme-appearance-pill__icon" />
        </button>
      </div>
    </div>
  );
}

