/** Minimal canvas until feature routes are rebuilt. */
export function AppPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="app-canvas-page">
      <span className="app-canvas-page__label">{title}</span>
    </div>
  );
}
