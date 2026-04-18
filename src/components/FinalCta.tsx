import { Link } from "react-router-dom";
import { SITE_ORIGIN } from "../site";

export function FinalCta() {
  return (
    <section className="section section--headline bg-theme-bg text-theme-text">
      <div className="container">
        <div className="mx-auto max-w-prose-medium-wide text-center">
          <h2 className="type-xl mb-v1 text-balance sm:type-2xl mx-auto">Bring your team to Klick.</h2>
          <div className="flex flex-wrap items-center justify-center gap-x-g1 gap-y-2">
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
              <a className="btn btn--secondary" href={SITE_ORIGIN + "/contact?source=homepage_footer"}>
                Talk to sales
                <div aria-hidden className="btn-icon">
                  <span>→</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
