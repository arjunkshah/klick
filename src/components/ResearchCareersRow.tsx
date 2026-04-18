import { captured } from "../assets/captured";
import { SITE_ORIGIN } from "../site";

export function ResearchCareersRow() {
  return (
    <section className="section section--flush-x bg-theme-bg text-theme-text">
      <div className="section section--flush-y">
        <div className="container mb-v3">
          <div className="grid grid-rows-[auto_1fr]">
            <div className="card card--large grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid">
              <div className="col-span-full row-start-1 row-end-2 grid max-lg:col-span-full lg:[grid-column:1/9] lg:row-start-1 lg:row-end-3 lg:items-center lg:pl-g0.25 lg:pr-g3">
                <div className="max-w-prose w-full lg:justify-self-start">
                  <div className="type-base">
                    <h3 className="type-base text-pretty lg:type-md">
                      Klick is a product and research team building humane orchestration—where AI
                      accelerates teams without erasing the craft of great work.
                    </h3>
                  </div>
                  <div className="mt-v8/12">
                    <a href={SITE_ORIGIN + "/careers"} className="btn-tertiary">
                      Join us <span className="btn-icon">→</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="max-lg:mt-g1.75 col-span-full row-start-2 row-end-3 grid max-lg:col-span-full lg:[grid-column:9/25] lg:row-start-1 lg:row-end-3 lg:items-center" />
            </div>
            <div className="grid-cursor col-span-full row-span-full max-lg:grid-rows-subgrid gap-y-0 p-g1.75">
              <div className="col-span-full row-start-1 row-end-2 grid max-lg:col-span-full lg:[grid-column:1/9] lg:row-start-1 lg:row-end-2 lg:items-center lg:pl-g0.25 lg:pr-g3" />
              <div className="max-lg:pt-v1 col-span-full row-start-2 row-end-3 grid max-lg:col-span-full lg:[grid-column:9/25] lg:row-start-2 lg:row-end-3 lg:items-center">
                <div className="media-border-container relative bg-theme-media-backdrop">
                  <img
                    src={captured.parallelB}
                    alt=""
                    className="block h-auto w-full"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
