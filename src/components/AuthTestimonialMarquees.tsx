import { testimonials } from "../data/testimonials";

function MarqueeCard({ quote, name, title, org, avatar }: (typeof testimonials)[number]) {
  return (
    <div className="auth-marquee-card flex w-[min(17.5rem,72vw)] shrink-0 flex-col rounded-[var(--radius-xs)] border border-theme-border-02 bg-theme-card-hex/92 px-g1 py-v3/12 backdrop-blur-[6px]">
      <p className="type-sm line-clamp-2 text-pretty text-theme-text">“{quote}”</p>
      <div className="mt-v3/12 flex min-w-0 items-center gap-[var(--spacing-g0-75)]">
        <div className="avatar-border-container h-8 w-8 shrink-0">
          <img src={avatar} alt="" width={32} height={32} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="type-product-sm truncate text-theme-text">{name}</div>
          <div className="type-product-sm truncate text-theme-text-sec">
            {title}, {org}
          </div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse }: { items: readonly (typeof testimonials)[number][]; reverse?: boolean }) {
  const loop = [...items, ...items];
  return (
    <div className={`auth-marquee-row ${reverse ? "auth-marquee-row--reverse" : ""}`}>
      <div className="auth-marquee-track">
        {loop.map((t, i) => (
          <MarqueeCard key={`${t.name}-${i}`} {...t} />
        ))}
      </div>
    </div>
  );
}

export function AuthTestimonialMarquees() {
  const rowA = testimonials.filter((_, i) => i % 2 === 0);
  const rowB = testimonials.filter((_, i) => i % 2 === 1);

  return (
    <div className="auth-split__marquees" role="region" aria-label="What teams say about Klick">
      <MarqueeRow items={rowA} />
      <MarqueeRow items={rowB} reverse />
    </div>
  );
}
