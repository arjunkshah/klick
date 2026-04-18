import { Link } from "react-router-dom";
import { captured } from "../assets/captured";
import { SITE_ORIGIN } from "../site";
import { Reveal } from "./Reveal";
import { RevealHeadingByWords } from "./RevealHeadingByWords";

const HERO_HEADLINE =
  "Linear focus, Notion context, Slack pace—one AI-native workspace for the agentic era.";
const heroWordCount = HERO_HEADLINE.split(/\s+/).filter(Boolean).length;
const heroCtaDelay = 0.1 * Math.max(0, heroWordCount - 1) + 0.2;

export function HeroSection() {
  return (
    <section className="section bg-theme-bg text-theme-text section--first-child">
      <div className="container">
        <div className="mb-v2.5 max-w-prose text-left">
          <RevealHeadingByWords
            text={HERO_HEADLINE}
            as="h1"
            className="type-md-lg mb-v1 text-balance"
          />
          <Reveal kind="blurUp" delay={heroCtaDelay} amount={0.3}>
            <div className="flex justify-start gap-x-g1 items-center">
              <div className="hidden items-center md:flex">
                <Link className="btn" to="/signup">
                  Get started free
                  <div aria-hidden className="btn-icon">
                    <span className="icon-glyph-08">→</span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center md:hidden">
                <a href={SITE_ORIGIN + "/demo"} className="btn">
                  Book a demo
                  <div aria-hidden className="btn-icon">
                    <span>→</span>
                  </div>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <Reveal kind="illustrate" delay={0.16} amount={0.2} viewportMargin="-80px 0px">
        <div
          className="media-border-container relative"
          style={{ background: "var(--color-theme-card-03)" }}
        >
          <img
            src={captured.hero}
            alt=""
            className="block h-auto w-full"
            width={2600}
            height={1360}
            decoding="async"
          />
        </div>
      </Reveal>
    </section>
  );
}
