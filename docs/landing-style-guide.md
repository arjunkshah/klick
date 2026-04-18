# Landing page style guide (Klick marketing)

This documents what the lander (`LandingPage` and its sections) actually uses so auth and other surfaces can match **without inventing parallel tokens**.

## Source of truth

| Layer | Where it lives |
|--------|----------------|
| **Color, radii, motion, grid base** | `:root` and `html[data-theme="dark"]` in `src/index.css` |
| **Tailwind theme aliases** | `tailwind.config.js` → `colors.theme-*` map to the same CSS variables |
| **Layout width** | `.container` in `src/index.css` (max-width steps + horizontal `padding-inline: var(--spacing-g2)`) |
| **Section rhythm** | `.section`, `.section--first-child`, `.section--headline` |
| **Typography** | `.type-sm`, `.type-base`, `.type-md`, `.type-md-lg`, `.type-lg`, `.type-xl`, `.sm:type-2xl`, etc. |
| **Actions** | `.btn`, `.btn--sm`, `.btn--secondary`, `.btn--ghost`, `.btn--quinary`, `.btn-tertiary`, `.btn-icon` |
| **Prose width** | `.max-w-prose` (65ch), `.max-w-prose-medium-wide` (80ch via `--spacing-prose-medium-wide`) |

## Colors (light default)

Defined as CSS variables on `:root` in `src/index.css`:

| Token | Role |
|--------|------|
| `--color-theme-bg` | Page background (`#ecebe6`) |
| `--color-theme-fg` | Primary “ink” / button fill on light |
| `--color-theme-text` | Default body text (= fg) |
| `--color-theme-text-sec` | Secondary copy (alpha on fg) |
| `--color-theme-text-mid` | Muted |
| `--color-theme-text-tertiary` | Tertiary / rules |
| `--color-theme-accent` | Links & accent actions (`#4f46e5` light) |
| `--color-theme-accent-muted` | Focus rings, subtle accent UI |
| `--color-theme-border-01` | Hairlines, media frames |
| `--color-theme-border-02` | Inputs, dividers |
| `--color-theme-border-02-5` | Ghost button stroke |
| `--color-theme-card-*-hex` | Card / hover surfaces |
| `--color-theme-button-bg` / `--color-theme-button-text` | Primary filled button |
| `--color-theme-media-backdrop` | Image placeholders |

**Dark:** `html[data-theme="dark"]` overrides the same names (warm near-black bg, light fg, lighter accent).

**In JSX:** Prefer utilities `bg-theme-bg`, `text-theme-text`, `text-theme-text-sec`, `border-theme-border-02`, etc., so components track the active theme.

## Typography

| Class | Use on lander |
|--------|----------------|
| `.type-md-lg` | Hero `<h1>` (`--text-md-lg`, snug line-height, normal weight, tracking) |
| `.type-xl` / `.sm:type-2xl` | Large headlines (e.g. final CTA) |
| `.type-base` | Body blocks, feature titles |
| `.type-md` | Responsive step-up from `type-base` at `lg` |
| `.type-sm` | Nav-sized UI copy |
| `.type-product-base` / `.type-product-sm` | Mono / product-style labels (Berkeley Mono) |

**Fonts:** `--font-sans` (Cursor Gothic stack), `--font-berkeley-mono` for code/mono.

**Root:** `html { font-size: 0.9375rem }` — everything scales from that.

## Spacing scale

Core primitives in `:root`:

- **`--g`** (`calc(10rem / 16)`) → horizontal “grid” spacing  
- **`--v`** (`calc(1rem * 1.4)`) → vertical rhythm  

Mapped utilities (non-exhaustive; see `src/index.css`):

| Variable / utility | Typical use |
|--------------------|-------------|
| `--spacing-g2`, `.px-g2`, `.container` inline pad | Section / page gutters |
| `--spacing-v3`, `.section` | Default section vertical padding |
| `--spacing-v5`, `.section--first-child` | Extra top padding below header for first section |
| `.mb-v1`, `.mb-v2.5`, `.mb-v4` | Marketing vertical gaps |
| `.gap-x-g1` | Horizontal gap between buttons (hero / CTA) |
| `.gap-g1` | Generic gap using `--spacing-g1` |

## Layout patterns (lander)

- **Header:** `SiteHeader` — fixed, `h-[var(--site-header-height)]` (56px), `px-g2`, `container` grid.
- **Main:** `main` gets `padding-top: var(--site-header-height)` so content clears the header.
- **Sections:** `className="section bg-theme-bg text-theme-text"`; first section adds `section--first-child`.
- **Content column:** Inner `container` → `max-w-prose` (or `max-w-prose-medium-wide` for centered wide CTA).
- **Media:** `media-border-container` + `border-radius: var(--radius-sm)` + `::after` hairline `border-color: var(--color-theme-border-01)`.

## Buttons (lander)

| Class | When |
|--------|------|
| `.btn` | Primary CTA (pill, filled `button-bg`) |
| `.btn--sm` | Compact primary |
| `.btn--secondary` | Secondary pill (card surface + border) |
| `.btn--ghost` | Outline / quiet |
| `.btn--quinary` | Text-only (e.g. “Sign in” in nav) |
| `.btn-tertiary` | Accent text link (e.g. “See … →”) |
| `.btn-icon` | Arrow wrapper inside `.btn` |

Padding tokens: `--button-padding-default`, `--button-padding-sm`. Motion: `transform` + `scale(0.98)` on `:active` (respect `prefers-reduced-motion` globals).

## Auth parity checklist

Auth should use the **same** variables and classes:

- Shell: `bg-theme-bg text-theme-text`
- Width: inner `.container` + `max-w-prose w-full`
- Top rhythm: `padding-block-start: var(--spacing-v5)` on the form column (equivalent to first marketing section)
- Page title: `type-md-lg text-balance mb-v1` (same as hero headline scale)
- Primary / Google: `btn w-full` / `btn btn--ghost w-full`
- Fields: `type-sm text-theme-text-sec` labels; `app-input w-full` inputs
- Links: `btn-tertiary` for switch link
- Dividers: `auth-split__rule` (uses theme borders + mono label style)

The auth visual column uses a static hero image (`/auth-hero.png`) in a `media-border-container`, with `bg-theme-media-backdrop` behind `object-cover` (same framing pattern as feature imagery).
