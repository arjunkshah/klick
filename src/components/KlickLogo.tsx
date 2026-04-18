export function KlickLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block text-[1.375rem] font-semibold tracking-[-0.035em] leading-none ${className}`}
      aria-hidden
    >
      Klick
    </span>
  );
}
