import { Link } from "react-router-dom";
import { KlickLogo } from "./KlickLogo";
import { SITE_ORIGIN } from "../site";

export function SiteHeader() {
  return (
    <header
      id="site-header"
      className="sticky top-0 z-50 w-full border-b border-[var(--color-theme-border-01)] bg-theme-bg px-g2 text-theme-text"
    >
      <div className="relative z-[2] container grid h-[var(--site-header-height)] grid-cols-[auto_1fr] items-center gap-x-4 lg:grid-cols-[auto_1fr_auto]">
        <a href="#main" className="skipnav btn btn--sm">
          Skip to content
        </a>
        <div className="col-start-1 row-start-1 flex items-center">
          <Link
            className="relative left-[-2px] inline-flex items-center text-theme-text"
            aria-label="Homepage"
            to="/"
          >
            <KlickLogo />
            <span className="sr-only">Klick</span>
          </Link>
        </div>
        <nav
          className="col-start-2 row-start-1 hidden items-center justify-center justify-self-center lg:flex"
          role="navigation"
        >
          <ul className="flex items-center justify-center">
            <li className="relative flex items-center">
              <a className="nav__link" href={SITE_ORIGIN + "/product"}>
                Product
              </a>
              <span className="nav__btn-caret nav__btn-caret--sm" aria-hidden>
                ↓
              </span>
            </li>
            <li>
              <a className="nav__link" href={SITE_ORIGIN + "/enterprise"}>
                Enterprise
              </a>
            </li>
            <li>
              <a className="nav__link" href={SITE_ORIGIN + "/pricing"}>
                Pricing
              </a>
            </li>
            <li className="relative flex items-center">
              <a className="nav__link" href={SITE_ORIGIN + "/resources"}>
                Resources
              </a>
              <span className="nav__btn-caret" aria-hidden>
                ↓
              </span>
            </li>
          </ul>
        </nav>
        <div className="col-start-2 flex items-center justify-end gap-1 lg:col-start-3">
          <Link className="btn--quinary" to="/login">
            Sign in
          </Link>
          <a
            className="btn btn--ghost btn--sm hidden lg:inline-flex"
            href={SITE_ORIGIN + "/contact?source=nav"}
          >
            <span className="hidden xl:inline">Contact sales</span>
            <span className="xl:hidden">Contact</span>
          </a>
          <Link className="btn btn--sm max-sm:hidden" to="/signup">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
