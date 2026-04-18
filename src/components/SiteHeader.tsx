import { Link } from "react-router-dom";
import { KlickLogo } from "./KlickLogo";
import { SITE_ORIGIN } from "../site";

export function SiteHeader() {
  return (
    <header
      id="site-header"
      className="bg-theme-bg px-g2 fixed top-0 left-0 z-50 w-full text-theme-text"
    >
      <div className="relative z-[2] container grid h-[var(--site-header-height)] grid-cols-[1fr_auto_auto] items-center lg:grid-cols-[auto_1fr_auto]">
        <a href="#main" className="skipnav btn btn--sm">
          Skip to content
        </a>
        <div className="col-start-1 col-end-2 row-start-1 row-end-2">
          <Link
            className="relative left-[-2px] top-[0.2rem] inline-flex items-center text-theme-text"
            aria-label="Homepage"
            to="/"
          >
            <KlickLogo />
            <span className="sr-only">Klick</span>
          </Link>
        </div>
        <div className="hidden lg:block">
          <nav
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
        </div>
        <div className="col-start-2 col-end-4 flex items-center justify-end gap-1 lg:col-start-3 lg:col-end-4">
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
