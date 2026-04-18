import { SITE_ORIGIN, avatarUrl } from "../site";

const posts: {
  date: string;
  dateTime: string;
  kind: string;
  title: string;
  author: string;
  read: string;
  href: string;
  avatar: string;
}[] = [
  {
    date: "Mar 27, 2026",
    dateTime: "2026-03-27",
    kind: "Research",
    title: "Designing autonomy sliders for multi-agent playbooks",
    author: "Avery Lin",
    read: "6 min read",
    href: "/blog/autonomy-sliders",
    avatar: avatarUrl("AveryLin"),
  },
  {
    date: "Apr 2, 2026",
    dateTime: "2026-04-02",
    kind: "Product",
    title: "Meet Klick 2—context graph, Slack fabric, smarter handoffs",
    author: "Klick Team",
    read: "9 min read",
    href: "/blog/klick-2",
    avatar: avatarUrl("KlickTeam"),
  },
  {
    date: "Mar 19, 2026",
    dateTime: "2026-03-19",
    kind: "Product",
    title: "Linear + Notion + Slack: how we unified the triangle",
    author: "Morgan Ellis",
    read: "5 min read",
    href: "/blog/unified-triangle",
    avatar: avatarUrl("MorganEllis"),
  },
  {
    date: "Mar 11, 2026",
    dateTime: "2026-03-11",
    kind: "Engineering",
    title: "Benchmarking orchestration latency across enterprise tenants",
    author: "Riley Patel",
    read: "8 min read",
    href: "/blog/orchestration-benchmarks",
    avatar: avatarUrl("RileyPatel"),
  },
];

export function BlogHighlights() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <h2 className="type-md mb-v1 text-theme-text">From the Klick journal</h2>
        <div className="-mx-g2 no-scrollbar snap-x-mandatory scroll-px-g2 overflow-x-auto lg:mx-0 lg:snap-none lg:scroll-px-0 lg:overflow-visible">
          <div className="flex w-max gap-g1 px-g2 lg:grid lg:w-full lg:grid-cols-3 lg:px-0 xl:grid-cols-4">
            {posts.map((p) => (
              <article
                key={p.href}
                className="flex h-full w-[min(22rem,calc(100vw-2.5rem))] shrink-0 snap-start grow flex-col sm:w-[min(20rem,calc(100vw-3rem))] lg:w-auto lg:min-w-0 lg:shrink"
              >
                <a className="card card--text flex grow flex-col" href={SITE_ORIGIN + p.href}>
                  <div className="flex flex-col">
                    <div className="type-base text-theme-text-mid flex shrink-0 flex-wrap items-center gap-x-v2/12 gap-y-v1/12">
                      <time className="type-base" dateTime={p.dateTime}>
                        {p.date}
                      </time>
                      <span aria-hidden>·</span>
                      <span>{p.kind}</span>
                    </div>
                    <div className="grow">
                      <p className="type-base text-pretty text-theme-text">{p.title}</p>
                    </div>
                    <div className="mt-v8/12 flex flex-wrap items-center gap-x-v4/12 gap-y-v3/12">
                      <div className="flex -space-x-2">
                        <div
                          className="avatar-border-container relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden bg-theme-card-03-hex first:ml-0"
                          style={{ zIndex: 1 }}
                        >
                          <img
                            src={p.avatar}
                            alt=""
                            width={24}
                            height={24}
                            className="h-full w-full object-cover"
                            decoding="async"
                          />
                        </div>
                      </div>
                      <div className="type-base min-w-0 text-theme-text-mid">
                        <span>{p.author}</span>
                        <span className="whitespace-nowrap">
                          <span aria-hidden> · </span>
                          <span>{p.read}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-v2">
          <a href={SITE_ORIGIN + "/blog"} className="btn-tertiary">
            View all posts →
          </a>
        </div>
      </div>
    </section>
  );
}
