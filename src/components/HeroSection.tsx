import { Link } from "react-router-dom";
import { captured } from "../assets/captured";
import { SITE_ORIGIN } from "../site";

export function HeroSection() {
  return (
    <section className="section bg-theme-bg text-theme-text section--first-child">
      <div className="container">
        <div className="text-left mb-v2.5 max-w-prose">
          <h1 className="type-md-lg text-balance mb-v1">
            Linear focus, Notion context, Slack pace—one AI-native workspace for the agentic era.
          </h1>
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
        </div>
      </div>
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
    </section>
  );
}
