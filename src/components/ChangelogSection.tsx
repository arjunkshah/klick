import { SITE_ORIGIN } from "../site";
import { Reveal } from "./Reveal";
import { RevealHeadingByWords } from "./RevealHeadingByWords";

const entries: {
  version?: string;
  date: string;
  title: string;
  href: string;
  dateTime: string;
}[] = [
  {
    version: "2.4",
    date: "Apr 13, 2026",
    dateTime: "2026-04-13",
    title: "Slack fabric v2: threaded approvals + agent mentions in-channel",
    href: "/changelog/2-4",
  },
  {
    date: "Apr 8, 2026",
    dateTime: "2026-04-08",
    title: "Playbook builder: drag-and-drop agent steps with guardrail presets",
    href: "/changelog/2026-04-08",
  },
  {
    version: "2.3",
    date: "Apr 2, 2026",
    dateTime: "2026-04-02",
    title: "Context graph insights—see how work flows across teams",
    href: "/changelog/2-3",
  },
];

export function ChangelogSection() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container flex flex-col gap-v2">
        <RevealHeadingByWords text="Changelog" as="h2" className="type-md text-theme-text" />

        <Reveal kind="blurUp" delay={0.12} amount={0.12}>
          <div className="-mx-g2 no-scrollbar snap-x-mandatory scroll-px-g2 overflow-x-auto lg:mx-0 lg:snap-none lg:scroll-px-0 lg:overflow-visible">
            <div className="flex w-max gap-g1 px-g2 lg:grid lg:w-full lg:grid-cols-3 lg:px-0 lg:pb-0 xl:grid-cols-4">
              {entries.map((e) => (
                <article
                  key={e.href}
                  className="flex h-full w-[min(22rem,calc(100vw-2.5rem))] shrink-0 snap-start flex-col sm:w-[min(20rem,calc(100vw-3rem))] lg:w-auto lg:min-w-0 lg:shrink"
                >
                  <a
                    className="card flex h-full grow flex-col gap-v3/12 pb-g2"
                    href={SITE_ORIGIN + e.href}
                  >
                    <div className="text-theme-text-mid relative -left-px flex flex-wrap items-center gap-x-grid gap-y-v1/12">
                      {e.version ? <span className="label">{e.version}</span> : null}
                      <time className="type-base" dateTime={e.dateTime}>
                        {e.date}
                      </time>
                    </div>
                    <p className="type-base text-pretty text-theme-text">{e.title}</p>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="pt-v3/12">
          <a href={SITE_ORIGIN + "/changelog"} className="btn-tertiary">
            See what&apos;s new in Klick →
          </a>
        </div>
      </div>
    </section>
  );
}
