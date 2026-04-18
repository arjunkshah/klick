import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/useTheme";

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
        {theme === "light" ? (
          <Moon size={15} strokeWidth={1.75} className="theme-appearance-compact__icon" aria-hidden />
        ) : (
          <Sun size={15} strokeWidth={1.75} className="theme-appearance-compact__icon" aria-hidden />
        )}
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
          <Sun
            size={15}
            strokeWidth={1.75}
            className="theme-appearance-pill__icon"
            aria-hidden
          />
        </button>
        <button
          type="button"
          className="theme-appearance-pill__btn"
          aria-pressed={theme === "dark"}
          aria-label="Dark theme"
          title="Dark"
          onClick={() => setTheme("dark")}
        >
          <Moon
            size={15}
            strokeWidth={1.75}
            className="theme-appearance-pill__icon"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
