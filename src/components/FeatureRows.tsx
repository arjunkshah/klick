import { captured } from "../assets/captured";
import { SITE_ORIGIN } from "../site";

function MediaImg({ src }: { src: string }) {
  return (
    <div className="media-border-container relative bg-theme-media-backdrop">
      <img src={src} alt="" className="block h-auto w-full" decoding="async" />
    </div>
  );
}

const textL = "max-lg:col-span-full lg:[grid-column:1/9]";
const visR = "max-lg:col-span-full lg:[grid-column:9/25]";
const textR = "max-lg:col-span-full lg:[grid-column:17/25]";
const visL = "max-lg:col-span-full lg:[grid-column:1/17]";

export function FeatureRows() {
  return (
    <section className="section section--flush-x bg-theme-bg text-theme-text">
      <div className="section section--flush-y bg-theme-bg text-theme-text">
        <div className="container mb-v3">
          <div className="grid grid-rows-[auto_1fr]">
            <a
              className="card card--large card--feature grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid"
              href={SITE_ORIGIN + "/product/issues"}
            >
              <div
                className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-3 lg:items-center lg:pl-g0.25 lg:pr-g3 ${textL}`}
              >
                <div className="max-w-prose w-full lg:justify-self-start">
                    <div className="type-base">
                      <h3 className="type-base text-pretty lg:type-md">
                        Orchestrate work like Linear—now with agents
                      </h3>
                      <div className="type-base text-pretty text-theme-text-sec lg:type-md">
                        Cycles, owners, and priorities stay crisp while Klick agents draft updates,
                        unblock dependencies, and keep rituals on rails.
                      </div>
                    </div>
                    <div className="mt-v8/12">
                      <span className="btn-tertiary">See issue intelligence →</span>
                    </div>
                  </div>
              </div>
              <div
                className={`max-lg:mt-g1.75 col-span-full row-start-2 row-end-3 grid cursor-default items-end lg:row-start-1 lg:row-end-3 lg:items-center ${visR}`}
              />
            </a>
            <div className="grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid gap-y-0 p-g1.75">
              <div
                className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-2 lg:items-center lg:pl-g0.25 lg:pr-g3 ${textL}`}
              />
              <div
                className={`max-lg:pt-v1 col-span-full row-start-2 row-end-3 grid cursor-default items-end lg:row-start-2 lg:row-end-3 lg:items-center ${visR}`}
              >
                <MediaImg src={captured.agents} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section section--flush-y bg-theme-bg text-theme-text">
        <div className="container mb-v3">
          <div className="grid grid-rows-[auto_1fr]">
            <div className="card card--large grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid">
              <div
                className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-3 lg:items-center lg:pl-g3 lg:pr-g0.25 ${textR}`}
              >
                <div className="max-w-prose w-full lg:justify-self-end">
                    <div className="type-base">
                      <h3 className="type-base text-pretty lg:type-md">
                        Notion-grade context, without the tab sprawl
                      </h3>
                      <div className="type-base text-pretty text-theme-text-sec lg:type-md">
                        Living specs, decisions, and customer notes stay linked to the work—so everyone
                        sees the same story from roadmap to retro.
                      </div>
                    </div>
                    <div className="mt-v1">
                      <a href={SITE_ORIGIN + "/product/docs"} className="btn-tertiary">
                        Explore docs &amp; decisions →
                      </a>
                    </div>
                  </div>
              </div>
              <div
                className={`max-lg:mt-g1.75 col-span-full row-start-2 row-end-3 grid lg:row-start-1 lg:row-end-3 lg:items-center ${visL}`}
              />
            </div>
            <div className="grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid gap-y-0 p-g1.75">
              <div
                className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-2 lg:items-center lg:pl-g3 lg:pr-g0.25 ${textR}`}
              />
              <div
                className={`max-lg:pt-v1 col-span-full row-start-2 row-end-3 grid items-end lg:row-start-2 lg:row-end-3 lg:items-center ${visL}`}
              >
                <MediaImg src={captured.parallelA} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section section--flush-y bg-theme-bg text-theme-text">
        <div className="container mb-v3">
          <div className="grid grid-rows-[auto_1fr]">
            <a
              className="card card--large card--feature grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid"
              href={SITE_ORIGIN + "/product/integrations"}
            >
              <div
                className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-3 lg:items-center lg:pl-g0.25 lg:pr-g3 ${textL}`}
              >
                <div className="max-w-prose w-full lg:justify-self-start">
                    <div className="type-base">
                      <h3 className="type-base text-pretty lg:type-md">Slack pulse, minus the noise</h3>
                      <div className="type-base text-pretty text-theme-text-sec lg:type-md">
                        Klick turns channels into actionable threads—summaries, approvals, and agent
                        handoffs land where your team already lives.
                      </div>
                    </div>
                    <div className="mt-v8/12">
                      <code className="type-product-base-mono rounded-xs border border-theme-border-02 bg-theme-card-hex px-g1 py-v2.5/12 text-theme-text">
                        klick link slack --workspace acme
                      </code>
                    </div>
                  </div>
              </div>
              <div
                className={`max-lg:mt-g1.75 col-span-full row-start-2 row-end-3 grid cursor-default items-end lg:row-start-1 lg:row-end-3 lg:items-center ${visR}`}
              />
            </a>
            <div className="grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid gap-y-0 p-g1.75">
              <div
                className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-2 lg:items-center lg:pl-g0.25 lg:pr-g3 ${textL}`}
              />
              <div
                className={`max-lg:pt-v1 col-span-full row-start-2 row-end-3 grid cursor-default items-end lg:row-start-2 lg:row-end-3 lg:items-center ${visR}`}
              >
                <MediaImg src={captured.toolsRow} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section section--flush-y bg-theme-bg text-theme-text">
        <div className="container mb-v3">
          <div className="grid grid-rows-[auto_1fr]">
            <div className="card card--large grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid">
              <div
                className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-3 lg:items-center lg:pl-g3 lg:pr-g0.25 ${textR}`}
              >
                <div className="max-w-prose w-full lg:justify-self-end">
                    <div className="type-base">
                      <h3 className="type-base text-pretty lg:type-md">AI that coordinates, not confuses</h3>
                      <div className="type-base text-pretty text-theme-text-sec lg:type-md">
                        Give every playbook an autonomy slider: from gentle nudges to full agent runs
                        across tools—with guardrails your security team can trust.
                      </div>
                    </div>
                    <div className="mt-v1">
                      <a href={SITE_ORIGIN + "/product/agents"} className="btn-tertiary">
                        How orchestration works →
                      </a>
                    </div>
                  </div>
              </div>
              <div
                className={`max-lg:mt-g1.75 col-span-full row-start-2 row-end-3 grid lg:row-start-1 lg:row-end-3 lg:items-center ${visL}`}
              />
            </div>
            <div className="grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid gap-y-0 p-g1.75">
              <div
                className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-2 lg:items-center lg:pl-g3 lg:pr-g0.25 ${textR}`}
              />
              <div
                className={`max-lg:pt-v1 col-span-full row-start-2 row-end-3 grid items-end lg:row-start-2 lg:row-end-3 lg:items-center ${visL}`}
              >
                <MediaImg src={captured.tab} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
