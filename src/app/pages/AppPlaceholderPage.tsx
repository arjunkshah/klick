import { useKlickStore } from "../../data/store";

/** Placeholder routes (not Today). */
export function AppPlaceholderPage({ title }: { title: string }) {
  const workspace = useKlickStore((s) => s.workspace);

  return (
    <div className="app-page">
      <div className="container">
        <header className="mb-v3 max-w-prose-medium-wide">
          <p className="type-sm text-theme-text-sec">{workspace.name}</p>
          <h1 className="type-md-lg mt-v8/12 text-balance text-theme-text">{title}</h1>
        </header>
        <div className="card card--large max-w-md">
          <p className="type-base text-pretty text-theme-text-sec">
            <span className="text-theme-text">{title}</span> is on the way—navigation and theming
            already match the public site.
          </p>
        </div>
      </div>
    </div>
  );
}
