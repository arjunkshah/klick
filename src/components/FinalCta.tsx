import { Link } from "react-router-dom";
import { SITE_ORIGIN } from "../site";
import { Reveal } from "./Reveal";
import { RevealHeadingByWords } from "./RevealHeadingByWords";

const CTA_HEADLINE = "Bring your team to Klick.";
const ctaWordCount = CTA_HEADLINE.split(/\s+/).filter(Boolean).length;
const ctaButtonsDelay = 0.1 * Math.max(0, ctaWordCount - 1) + 0.28;

export function FinalCta() {
  return (
    <section className="section section--headline bg-theme-bg text-theme-text">
      <div className="container">
        <div className="mx-auto flex max-w-prose-medium-wide flex-col items-center gap-v2 text-center">
          <RevealHeadingByWords
            text={CTA_HEADLINE}
            as="h2"
            className="type-xl text-balance sm:type-2xl"
          />

          <Reveal kind="blurUp" delay={ctaButtonsDelay} amount={0.25}>
            <div className="flex flex-wrap items-center justify-center gap-x-g1 gap-y-[var(--spacing-v1)]">
              <div className="hidden items-center md:flex">
                <Link className="btn" to="/signup">
                  Get started free
                  <div aria-hidden className="btn-icon">
                    <span>→</span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center md:hidden">
                <a className="btn" href={SITE_ORIGIN + "/demo"}>
                  Book a demo
                  <div aria-hidden className="btn-icon">
                    <span>→</span>
                  </div>
                </a>
              </div>
              <div className="hidden md:block">
                <a
                  className="btn btn--secondary"
                  href={SITE_ORIGIN + "/contact?source=homepage_footer"}
                >
                  Talk to sales
                  <div aria-hidden className="btn-icon">
                    <span>→</span>
                  </div>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
