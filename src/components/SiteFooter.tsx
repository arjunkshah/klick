import { SITE_ORIGIN } from "../site";
import { ThemeAppearanceToggle } from "./ThemeAppearanceToggle";

type FooterLink = { label: string; path: string; external?: boolean };

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", path: "/product" },
      { label: "Issues & cycles", path: "/product/issues" },
      { label: "Docs & decisions", path: "/product/docs" },
      { label: "Agents", path: "/product/agents" },
      { label: "Integrations", path: "/product/integrations" },
      { label: "Enterprise", path: "/enterprise" },
      { label: "Pricing", path: "/pricing" },
      { label: "Security", path: "/security" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Changelog", path: "/changelog" },
      { label: "Docs", path: "/docs" },
      { label: "API reference", path: "/docs/api" },
      { label: "Templates", path: "/templates" },
      { label: "Community", path: "/community" },
      { label: "Status", path: "https://status.klick.app", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", path: "/careers" },
      { label: "Blog", path: "/blog" },
      { label: "Press", path: "/press" },
      { label: "Brand", path: "/brand" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", path: "/legal/terms" },
      { label: "Privacy Policy", path: "/legal/privacy" },
      { label: "DPA", path: "/legal/dpa" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "X", path: "https://x.com/klick", external: true },
      { label: "LinkedIn", path: "https://www.linkedin.com/company/klick", external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      id="site-footer"
      className="relative bg-theme-card-hex px-g2 pt-v3 pb-v3 text-theme-text md:pb-g3"
    >
      <div className="container mb-v4.5">
        <nav>
          <div className="grid grid-cols-2 gap-x-g1 gap-y-v2 md:grid-cols-5">
            {cols.map((col) => (
              <div key={col.title}>
                <h3 className="footer-heading">{col.title}</h3>
                <ul className="space-y-0">
                  {col.links.map(({ label, path, external }) => (
                    <li key={label}>
                      <a
                        className="footer-link footer-link-text hover:text-theme-text group inline-block py-v2.5/12"
                        href={external ? path : SITE_ORIGIN + path}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {label}
                        {external ? (
                          <span className="inline-block opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            &nbsp;↗
                          </span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
      <div className="container flex flex-col items-start justify-between gap-v2 border-t border-theme-border-02 pt-v2 md:flex-row md:items-center">
        <div className="type-sm text-theme-text-sec">© 2026 Klick</div>
        <div className="flex flex-wrap items-center gap-x-g1 gap-y-2">
          <ThemeAppearanceToggle />
          <a href={SITE_ORIGIN + "/security"} className="type-sm text-theme-text-sec hover:text-theme-text">
            Trust center
          </a>
        </div>
      </div>
    </footer>
  );
}
