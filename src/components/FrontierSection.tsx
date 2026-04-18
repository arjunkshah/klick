import { SITE_ORIGIN } from "../site";
import { Reveal } from "./Reveal";
import { RevealHeadingByWords } from "./RevealHeadingByWords";

const pills = ["Auto", "Playbooks", "Claude", "GPT-4.1", "Gemini", "Command"];

export function FrontierSection() {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <div className="mx-auto mb-v2 max-w-prose-medium-wide text-center">
          <RevealHeadingByWords
            text="Stay on the frontier of team velocity"
            as="h2"
            className="type-md text-balance"
          />
        </div>
        <div className="grid grid-cols-1 items-stretch gap-g1 xl:grid-cols-3">
          <Reveal kind="left" className="h-full min-h-0">
            <div className="card flex h-full flex-col">
            <div className="type-base flex max-w-prose grow flex-col">
              <div>
                <h3>Route the right model to every playbook</h3>
                <div className="text-pretty text-theme-text-sec">
                  Swap providers per workflow, keep spend predictable, and let Klick choose safe
                  defaults when speed matters most.
                </div>
              </div>
              <div className="mt-auto pt-v8/12">
                <a
                  href={SITE_ORIGIN + "/docs/models"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tertiary"
                >
                  Model routing guide ↗
                </a>
              </div>
            </div>
            <figure className="pt-g1.75">
              <div
                className="media-border-container max-h-[420px] overflow-visible bg-theme-card-03-hex"
                style={{ maxHeight: "min(420px, 70vh)" }}
              >
                <div className="relative w-full bg-transparent pt-[12%]">
                  <div className="mx-auto flex w-[88%] max-w-[360px] justify-center">
                    <div className="border-theme-border-02 relative w-full rounded-lg border bg-theme-product-editor shadow-[0_18px_36px_-18px_rgba(0,0,0,0.28),0_0_0_1px_var(--color-theme-border-02)]">
                      <div
                        className="type-product-lg text-theme-text-ter w-full bg-transparent px-3 pt-2.5 pb-2 opacity-60"
                        style={{ lineHeight: 1.8 }}
                      >
                        Ask Klick to run the launch readiness playbook
                      </div>
                      <div className="px-2 py-2 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="type-product-sm bg-theme-card-03-hex text-theme-text-sec flex items-center gap-1 rounded-full px-2 py-1">
                              <span className="opacity-60">◇</span>
                              Agent
                              <span className="opacity-60">▾</span>
                            </span>
                            <span className="type-product-sm text-theme-text-sec flex items-center gap-0.5 py-1">
                              Auto <span className="opacity-60">▾</span>
                            </span>
                          </div>
                        </div>
                        <div className="type-product-sm text-theme-text-sec mt-3 flex flex-wrap gap-1.5">
                          <span className="rounded border border-theme-border-02 bg-theme-card-hex px-2 py-0.5">
                            Auto
                          </span>
                          <span className="rounded border border-theme-accent-muted bg-theme-card-hex px-2 py-0.5 text-theme-accent">
                            Suggested ✓
                          </span>
                          {pills.slice(1).map((p) => (
                            <span
                              key={p}
                              className="rounded border border-theme-border-02 bg-theme-card-hex/90 px-2 py-0.5 opacity-90"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </figure>
            </div>
          </Reveal>
          <Reveal kind="right" delay={0.06} className="h-full min-h-0">
            <div className="card flex h-full flex-col">
            <div className="type-base flex max-w-prose grow flex-col">
              <div>
                <h3>Understand your org, not just your docs</h3>
                <div className="text-pretty text-theme-text-sec">
                  Klick connects people, projects, and customer context so agents propose the next
                  best move—not another generic summary.
                </div>
              </div>
              <div className="mt-auto pt-v8/12">
                <a href={SITE_ORIGIN + "/docs/context"} className="btn-tertiary">
                  How context graph works ↗
                </a>
              </div>
            </div>
            <figure className="pt-g1.75">
              <div className="media-border-container flex min-h-[280px] items-center justify-center bg-theme-card-03-hex px-4 py-10">
                <p className="type-product-base-mono max-w-[28ch] text-center text-theme-text-sec">
                  Who owns the rollout checklist for the Q2 pricing change?
                </p>
              </div>
            </figure>
            </div>
          </Reveal>
          <Reveal kind="left" delay={0.12} className="h-full min-h-0">
            <div className="card flex h-full flex-col">
            <div className="type-base flex max-w-prose grow flex-col">
              <div>
                <h3>Built for teams moving at agent speed</h3>
                <div className="text-pretty text-theme-text-sec">
                  Enterprise controls, audit trails, and human-in-the-loop approvals keep
                  autonomous workflows safe as you scale.
                </div>
              </div>
            </div>
            <figure className="pt-g1.75">
              <div className="media-border-container flex min-h-[280px] items-end justify-center overflow-hidden bg-theme-card-03-hex">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop"
                  alt=""
                  className="max-h-[320px] w-full object-cover"
                />
              </div>
            </figure>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
