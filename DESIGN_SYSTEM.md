# galeed.link — Design System

**Codename:** *Facility* · Half-Life–inspired, subtle modern editorial
**Target stack:** Astro + UnoCSS (`presetWind3`) + TypeScript
**Scope:** single-page personal developer link hub (`galeed.link`) — profile, bio, freelance work, side projects, open source, contact
**Document date:** 2026-11-22 · Live inspection via Playwright MCP (Chromium, desktop 1440×900, mobile 390×844)

> **How to read this document**
> - **[V]**: *Verified*. Read from the live page with `getComputedStyle`, `document.fonts`, or CSSOM rules. Each one cites its source:
>   **[HL2]** `half-life.com/en/halflife2` · **[BM]** `blackmesagame.com` · **[GL]** `galeed.link` · **[LK]** `linkd-layouts.framer.website/designer`
> - **[P]**: *Proposed*. An adaptation designed for this system. Every proposed contrast ratio below was computed with the WCAG 2.x relative-luminance formula.
> - All four URLs loaded and were inspected. Nothing was blocked. Where a value could not be observed, the document says so.

---

## Table of contents

1. [Design direction & live audit summary](#1-design-direction--live-audit-summary)
2. [Theming architecture (system-first + user toggle)](#2-theming-architecture-system-first--user-toggle)
3. [Color system (semantic tokens: Dark & Light)](#3-color-system-semantic-tokens-dark--light)
4. [Typography system](#4-typography-system)
5. [Layout, spacing & grid anatomy](#5-layout-spacing--grid-anatomy)
6. [Surfaces, borders, elevation & Half-Life micro-details](#6-surfaces-borders-elevation--half-life-micro-details)
7. [Component specifications](#7-component-specifications)
8. [Motion & interaction guidelines](#8-motion--interaction-guidelines)
9. [Astro + ITCSS + TypeScript implementation blueprint](#9-astro--itcss--typescript-implementation-blueprint)
10. [Anti-patterns & pre-delivery checklist](#10-anti-patterns--pre-delivery-checklist)
11. [Appendix: verification log](#11-appendix-verification-log)

---

## 1. Design direction & live audit summary

### 1.1 Direction in one paragraph

galeed.link stays a **single, centered, scannable column**, the same link-in-bio
shell it has today and the same one Linkd polishes. The Half-Life DNA comes in
through **discipline, not decoration**: warm industrial neutrals taken from
HL2's umber ink and Black Mesa's void blacks, **one** controlled HEV-orange
accent, DIN-style grotesque type with tracked uppercase labels, square-ish
"machined" geometry, 1px hairline rules, and a small amount of monospace
technical metadata. The page has no HUD frames, scanlines, glow, or game
imagery. In the light theme it should read like a clean editorial page in
charcoal ink on bone paper. In the dark theme it should read like a quiet Black
Mesa terminal room.

### 1.2 Extracted visual DNA: Half-Life 2 **[HL2]** (light, editorial)

| Aspect | Verified value | Notes |
| --- | --- | --- |
| Page background | `#e9e8e9` (`rgb(233,232,233)`) | `body` and `footer.main_footer` |
| Content surface | `#ffffff` | sections (`section.row`) |
| Primary ink | `#4b423c` (`rgb(75,66,60)`) | warm umber-grey. Used for body, h1, and `hr` |
| Accent (HEV orange) | `#ff862c` (`rgb(255,134,44)`) | active nav bg, nav borders, `button.buy` outline/fill |
| Accent light | `#ffaa6b` (`rgb(255,170,107)`) | sibling-nav bg, slider hover |
| Inverted hover ink | `#121918` (`rgb(18,25,24)`) | `.inverted a:hover button.buy` |
| Dark band | `#4b423c` bg | `section.gamefooter` |
| Font family | `din, -apple-system, system, sans-serif` | self-hosted **DIN Pro** WOFF: Light 200, Bold 700, Black 900 (+ italics). `apercu`, `circularstd`, `minionpro` are declared but showed **unloaded** |
| Body | 18px / 28.8px (1.6), weight **200** | very light |
| h1 | 40px / 48px, weight 900, no tracking | |
| Nav labels (h3/a) | 18px, weight 900, `uppercase`, `letter-spacing: 1px` | |
| Button `.buy` | 900, uppercase, 1px tracking, `border: 1px solid #ff862c`, `padding: 15px`, radius **0** | |
| Button hover | `::before` fill, `transform: skew(-33deg) translate(-110%) → translate(-10%)`, `transition: transform 300ms`. Colors `200ms` | the signature "diagonal wipe" |
| Nav | `li { height: 70px; border-bottom: 2px solid #ff862c }`, `a { border-left: 1px solid #ff862c; transition: background-color 200ms ease-out, color 200ms ease-out }` | |
| Rules | `hr { height: 1px; background: #4b423c }`, footer columns `border-left: 1px solid #4b423c`, table cells `border: 1px solid #4b423c` | hairline discipline |
| Radius | `0px` everywhere except language dropdown (`0.5em`) | |
| Shadows | none on content. Dropdown only: `rgba(0,0,0,.3) 0 0 10px` | |
| Container | header `max-width: 1300px`. Sections `max-width: 1140px; padding: 9vw 10vw` (80px at 1440) | |
| Breakpoints | `668px`, `820px`, `1300px` (+ max-width mirrors) | |

### 1.3 Extracted visual DNA: Black Mesa **[BM]** (dark, cinematic)

<!-- markdownlint-disable MD013 -->

| Aspect | Verified value | Notes |
| --- | --- | --- |
| Body bg | `#0a0a0a` (`--color-void`) | |
| Ink surfaces | `--color-ink: #171717`, `--color-ink-deep: #141414` (`rgb(20,20,20)`, `rgb(23,23,23)` observed) | |
| Accent | `--color-accent: #e37226` (`rgb(227,114,38)`) | CTA fill, labels, footer band, focus ring |
| HUD amber | `--color-hud-amber: #e3b12c` (`--hud-color`) | defined; not prominent on the home page |
| Blueprint | `--color-blueprint: #1f4472`, `--color-blueprint-light: #3a6ba8` | |
| Text | `#ffffff` with alpha tiers **.85 / .75 / .55** (oklab white / α) | |
| Font stack | `"DIN Pro", Barlow, "Barlow Fallback", ui-sans-serif, system-ui, sans-serif` | **No `@font-face` for DIN Pro.** Only **Barlow** is served (300/400/500/700/800/900 + italics, `font-display: swap`, WOFF2, unicode-range split), plus a metric-matched `Barlow Fallback`. On a machine without DIN Pro, **Barlow is what renders**. |
| Mono | `--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, …` | system stack only |
| Type roles (CSS classes) | `.type-display` `clamp(2.25rem, 1.6rem + 1.75vw, 3.125rem)` / 900 / lh 1.2 / `text-wrap: balance` · `.type-heading` `clamp(1.875rem, 1.45rem + 1.2vw, 2.5rem)` / 900 · `.type-title` 1.25rem / 800 / 1.3 · `.type-label` 1.0625rem / 900 / uppercase / 1px · `.type-label-sm` 0.875rem / 900 / uppercase / 1px · `.type-body` 1.125rem / **300** / 1.6 · `.type-lead` `clamp(1.1875rem, 1.05rem + .4vw, 1.375rem)` / 300 / 1.6 | a clean role-based type system worth copying structurally |
| Buttons | primary: `bg #e37226; border 1px #e37226; color #fff; min-h 40px; padding 0 20px` or `15px 30px` (54px tall). Secondary: `border 1px #fff; bg rgba(0,0,0,.3)`. Hover: `border-white bg-white text-ink`. `transition-colors 200ms`. Radius **0** | |
| Nav links | 14px / 900 / uppercase / 1px, `padding 8px 12px`, `transition 150ms cubic-bezier(.4,0,.2,1)`. Underline `::after`: `h-0.5` (2px), `bottom-1`, `inset-x-3`, `bg-accent`, `scale-x-0 → scale-x-100`, `origin-left`, `duration-300` | |
| Focus | `:focus-visible { outline: 2px; outline-offset: 2px; outline-color: var(--color-accent) }` | |
| Hover micro-motion | `group-hover:translate-x-0.5` (2px nudge on arrows), `group-hover:scale-105` on media, `hover:bg-white/[0.03–0.04]` | |
| Easing token | `--ease-out: cubic-bezier(0, 0, .2, 1)` | |
| Frame | `--container-frame: 1440px` | |
| Editorial motif | Press quotes attributed with accent uppercase labels: `—EUROGAMER`, `—PC GAMER`, `—IGN` | em-dash + uppercase tracking |
| A11y | `SKIP TO CONTENT` link (`sr-only focus:not-sr-only`) | |

<!-- markdownlint-enable MD013 -->

### 1.4 Structural audit: galeed.link **[GL]** (current baseline)

Observed facts:

- **Stack fingerprints:** UnoCSS (`--un-*` variables), lightningcss `light-dark()` polyfill (`--lightningcss-light/dark`), `astro-icon` Lucide sprites (`ai:lucide:linkedin|twitter|github|globe`). `lang="es"`. Computed `color-scheme: light dark`.
- **Font:** Manrope (single family). Body 18px / 27px (1.5) weight 400.
- **Palette (light):** bg `#f8fafc` (slate-50), text `#020618` (slate-950), secondary `#45556c` (slate-600). **Dark (via `prefers-color-scheme`):** bg `#020618`, text `#f8fafc`, secondary `#90a1b9` (slate-400). Link hover → slate-600 / slate-400.
- **Shell:** a centered card, `max-width: 448px`, radius 16px, `shadow-xl` (`0 20px 25px -5px rgb(0 0 0/.1), 0 8px 10px -6px rgb(0 0 0/.1)`). Page padding `48px 0` from `md`. On mobile (390 viewport) the card goes full-bleed at 375px with radius 0.
- **Hero:** square grayscale portrait (448×448 desktop, 375×375 mobile) with a bottom gradient fade into the background. h1 name 40px/700/−0.144px (fluid ≈37.4px on mobile). Role `"Frontend developer"` at 27px/500 in secondary color, **marked up as an `<h2>`**.
- **Social row:** 4 links (LinkedIn, Twitter, GitHub, Web), each a 24px icon stacked above a text label.
- **Section nav:** `Bio · Trabajo freelance · Side projects · Open source · Contacto`, 18px regular, 16px gap, horizontally scrollable.
- **Bio (`#bio`):** h2 "Bio" (27px/600). Two columns, *Sobre mí* and *Stack tech* (h3 20px/600), each a list of six items with **emoji as icons**, separated by a 1px vertical rule (`w-px bg-slate-950 dark:bg-slate-50`).
- **Focus:** `a:focus-visible { outline: 2px solid <text color>; outline-offset: 1px }`.

Issues verified during inspection:

| # | Issue | Evidence |
| --- | --- | --- |
| 1 | **4 of 5 nav anchors are broken.** Links point to `#blog`, `#about`, `#open-source`, `#contact`, but only `#bio` exists. Labels and IDs also disagree ("Trabajo freelance" → `#blog`, "Side projects" → `#about`). | DOM `[id]` scan: only `bio` |
| 2 | **Nav overflows with no affordance.** Desktop: the `ul` is 528px inside a 448px `nav`, so "Open source" is clipped and "Contacto" is hidden. Mobile: `scrollWidth 526 / clientWidth 375`. | computed geometry + screenshots |
| 3 | **Emoji used as icons.** The 🇦🇷 flag renders as the letters "AR" on Windows Chromium. | desktop screenshot |
| 4 | **`dark:` utilities don't apply under system dark mode.** In emulated dark, the Bio divider computes to `#020617` on a `#020618` background (invisible), and the shell shadow stays `rgba(0,0,0,.1)` on near-black (invisible). The theme flips by media query, but the `dark:` variants evidently expect a class/attribute. | `emulateMedia({colorScheme:'dark'})` + computed styles |
| 5 | Role text uses `<h2>`, which pollutes the heading outline. | accessibility snapshot |
| 6 | No manual theme toggle; system preference only. | — |
| 7 | Mobile Stack list wraps awkwardly ("Frontend / Developer"). | mobile screenshot |
| 8 | Console reported 1–2 errors on load (not investigated; outside design scope). | Playwright console |

### 1.5 Structural audit: Linkd **[LK]** (layout reference)

| Aspect | Verified value |
| --- | --- |
| Page bg / shell bg | `#0e0e11` / `#09090b` |
| Shell | 460px wide, radius **16px**, 48px from top. Shadow is a light ring stack: `rgba(250,250,250,.09) 0.3px 0.3px 1.28px -1px, rgba(250,250,250,.082) 1.14px 1.14px 4.85px -2px, rgba(250,250,250,.06) 5px 5px 21.2px -3px` |
| Mobile (390) | shell full-bleed (375px), radius 0, h1 drops 40 → **32px** |
| Hero | 460×460 grayscale portrait with gradient fade. h1 **Manrope 700, 40px / 56px, `letter-spacing: -1.6px`**, `#fafafa`. Role **Inter 500 16px / 28px `#a1a1aa`** |
| Social | 5 icon-only links, 24px glyphs, **no text labels** |
| Nav | Inter 500 18px `#a1a1aa`, horizontal overflow (same pattern as GL) |
| Section rhythm | content gutter **16px**. Each section is a flex column with **gap 16px**. **32px** between sections. Section h2 Manrope 700 24px / 24px |
| Link card | `#fafafa` bg, radius **8px**, padding **12px**, height **56px**, inset bottom-right shading (`inset -5px -5px 7px -3px rgba(0,0,0,.2)` + finer layers). Label Inter 700 16px `#09090b` |
| Section action | "VIEW ALL" Inter 700 14px + chevron, right-aligned beside h2 |
| Bento (Shop) | 2 columns of 206px square figures, radius 8px. Title Inter 500 18px. Meta Inter 400 14px `#a1a1aa` |
| Form | inputs radius 8px, padding 12px, 46px tall. **`#fafafa` text on `#a1a1aa` bg = 2.46:1 (fails AA)** |
| Footer | padding `32px 16px 16px`, top hairline, 12px/500 `#a1a1aa` centered |
| Fonts loaded | Manrope 700; Inter 400/500/600/700 |
| Behavior | **Sections below the fold render blank until scrolled into view** (appear animations). The first full-page capture showed an empty shell below "Services". |

### 1.6 What stays, what evolves, and the bridge

| Area | Stays (from GL) | Evolves (Linkd polish + HL DNA) |
| --- | --- | --- |
| Shell | single centered column, grayscale portrait with fade, full-bleed on mobile | width 448 → **480px** to fit a 2-col bento. Radius 16 → **8px** ("machined"). Shell gets a hairline border, so the edge stays visible in dark mode (fixes issue 4) |
| Hero | name, role, social row with **visible labels** (better than Linkd's icon-only row) | role becomes `<p>`. New slim **system bar** above the photo with mono metadata, theme toggle, and HL2's 2px orange underline rule |
| Nav | same five destinations | IDs fixed to match labels, uppercase DIN-style labels, **one scrolling line with faded edges** (owner's choice, 2026-11-23), BM accent underline indicator, sticky at every width (owner's choice, 2026-11-23) |
| Bio | two-column "Sobre mí / Stack tech" with **1px vertical rule** (HL2 uses the same footer-column rule) | emoji → SVG icons and mono tech chips. Optional lead paragraph |
| New sections | — | Freelance, Side projects and Open source (tiles with screenshots, §7.9), Contacto (one primary CTA), all built from Linkd's 56px card / 16px gap / 32px section rhythm |
| Color | light + dark | slate/blue-black → bone `#ede6d8` / charcoal `#1c1c1c` + HEV orange, authored in `oklch()`, **WCAG AAA** text contrast. Manual toggle with System default |
| Type | — | Manrope → **Barlow** (Black Mesa's own served face, DIN-like) + **JetBrains Mono** for metadata |

---

## 2. Theming architecture (system-first + user toggle)

### 2.1 Model

```text
                 ┌────────────── localStorage["galeed:theme"] ──────────────┐
                 │  absent  →  preference = "system"                          │
                 │  "light" →  preference = "light"                           │
                 │  "dark"  →  preference = "dark"                            │
                 └──────────────────────────┬─────────────────────────────────┘
                                            ▼
   inline <head> script (blocking, before first paint)
     resolved = preference === "system" ? matchMedia(dark) : preference
     <html data-theme="{resolved}" data-theme-pref="{preference}" style="color-scheme:{resolved}">
                                            ▼
   settings/colors.css (+ the Layout module for the shell shadow)
     :root { color-scheme: light dark }      → every light-dark() token follows the OS (also the no-JS path)
     :root[data-theme="light" | "dark"]      → pins color-scheme → every light-dark() token flips
     shadows block                           → .shell box-shadow per [data-theme] + no-JS @media
```

Rules:

1. **`data-theme` always holds the *resolved* theme** (`light | dark`), never `system`. CSS only has to handle two states, and UnoCSS `dark:` (if you ever use it) can key on one attribute selector. This fixes issue 4 from §1.4.
2. **`data-theme-pref`** records whether an override is stored (`system` = nothing stored, or the literal `light | dark`). The data model stays tri-state. Only the UI has two states (§7.2).
3. When the preference is `system`, a `matchMedia` listener re-resolves live if the OS theme changes.
4. **Two-state toggle** (modern-web-guidance `dark-mode-toggle`). One button flips to the *opposite of the rendered theme*:
   - If the target **differs** from the OS preference, it is stored literally (`light` / `dark`).
   - If the target **matches** the OS preference, the user is undoing their adjustment. The storage key is *removed*, so the site follows the OS again. The matching value is never stored, because that would silently pin the theme against future OS changes.
5. **Divergence is only checked when the user toggles, never retroactively.** If the OS later switches to match a stored override (for example, a time-of-day auto switch), the stored value is **kept**. Otherwise a theme could never be pinned.
6. Without JavaScript, the `@media` fallback still gives a correct system theme. The toggle stays hidden because it cannot work.
7. Components never use `dark:` variants for color. **They only consume semantic tokens**, which swap automatically.

### 2.2 Inline `<head>` script (prevents FOUC / theme flicker)

Place it in `src/layouts/Layout/index.astro` **before** any stylesheet link, and mark it `is:inline` so Astro doesn't bundle or defer it.

```astro
---
// src/layouts/Layout/index.astro (head excerpt)
---
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Follow the OS text size (Chrome/Edge 146+; other browsers ignore it). Requires never setting font-size on :root/html. -->
    <meta name="text-scale" content="scale" />
    <meta name="color-scheme" content="light dark" />
    <meta name="theme-color" content="#ede6d8" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#141414" media="(prefers-color-scheme: dark)" />
    <script is:inline>
      (() => {
        const KEY = 'galeed:theme';
        const root = document.documentElement;
        let pref = 'system';
        try {
          const stored = localStorage.getItem(KEY);
          if (stored === 'light' || stored === 'dark') pref = stored;
        } catch (_) { /* storage blocked: stay on system */ }
        const resolved =
          pref === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : pref;
        // setAttribute (not dataset) so the literal "data-theme" is in the built HTML,
        // where PurgeCSS's extractor can see it (§9.1 build pipeline).
        root.setAttribute('data-theme', resolved);
        root.setAttribute('data-theme-pref', pref);
        root.style.colorScheme = resolved;
      })();
    </script>
    <!-- stylesheets / fonts after this -->
  </head>
```

> If you use Astro View Transitions (`<ClientRouter />`), re-apply on `astro:after-swap`. The new document's `<html>` arrives without the attributes. See `initTheme()` in §9.8.

### 2.3 Persistence & toggle behavior (TypeScript)

The full module is in §9.8. Its behavior contract:

| Event | Result |
| --- | --- |
| User clicks the toggle, target ≠ OS theme | `data-theme` flips immediately, target stored literally, `themechange` dispatched |
| User clicks the toggle, target = OS theme | storage key **removed**. The site follows the OS again |
| OS theme changes while pref = system | re-resolve live, nothing persisted |
| OS theme changes while an override is stored | nothing happens. The override is kept, even if it now matches the OS |
| Another tab changes the theme (or clears storage) | `storage` event re-reads and repaints this tab. The icon and label follow through CSS |
| Rapid repeated clicks | each click reads the *rendered* `data-theme` (set synchronously by the previous click) and sets the **final state explicitly**, with no reliance on `transitionend` (cancellable state transitions) |

Example, with the OS starting in light: click → `dark` is stored and the site turns dark → OS switches to dark: the site stays dark and the value is kept → OS switches back to light: the site stays dark → click → the target (light) matches the OS, so the key is removed and the site follows the OS again.
| Theme swap | transitions are suppressed for two frames (`[data-theme-switching]`), so 200ms color transitions don't smear across the whole page |

### 2.4 Favicon `[P]`

The favicon sits in the browser's tab strip, so it follows the browser's color scheme through `@media (prefers-color-scheme)` inside `public/favicon.svg`, not the site's `data-theme`. It reuses existing primitives, with no new colors:

| Scheme | Disc | Ring + G | Ratio |
| --- | --- | --- | --- |
| Dark (default) | `--charcoal-950` | `--hev-400` | 7.63:1 (AAA) |
| Light | `--bone-50` | `--hev-text-l` | 7.78:1 (AAA) |

Both versions clear 7:1, the AAA text threshold, though a graphic only needs 3:1.
The ring's outer edge (r 28) stays inside the disc (r 32), so the mark always sits on its own disc and the tab strip color never changes the ratio.
`--hev-400` on `--bone-50` is only 2.13:1, so the light icon uses the darker text orange. The `.ico`, `apple-touch-icon.png` and manifest PNGs only have one version, rendered from the dark one. The SVG keeps hex literals because it is a standalone file outside the CSS pipeline; keep them in sync with `settings/colors.css`.

---

## 3. Color system (semantic tokens: Dark & Light)

**Target: WCAG 2.2 Level AAA.** All text (normal and large) is ≥ **7:1** against
every surface it can sit on (SC 1.4.6, Contrast Enhanced). Non-text UI
boundaries and the focus indicator are ≥ **3:1** (SC 1.4.11 has no AAA level;
the focus ring also meets SC 2.4.13 Focus Appearance, see §3.5). Tokens are
authored in **`oklch()`**. The hex values next to them are what browsers render,
and every ratio in §3.4 was computed from those rendered values.

### 3.1 Derivation

- **Light ("bone paper"):** **bone `#ede6d8`** page and **charcoal `#1c1c1c`** text, the pair chosen for this site. HL2's grey `#e9e8e9` **[V]** is replaced by bone, which keeps the editorial "paper" feel but is warmer. Surfaces step *up* in lightness: bone → light bone `#f5f0e6` → white.
- **Dark ("Black Mesa"):** the same pair, inverted. **Charcoal `#1c1c1c`** is the main surface, **bone `#ede6d8`** the main text. The page canvas is `#141414`, Black Mesa's real `ink-deep` **[V]**.
- **Accent:** HL2's **`#ff862c`** **[V]** is the brand fill in both themes, and HL2's **`#ffaa6b`** **[V]** is its hover in both themes. Both always carry **charcoal ink, never white** (white on `#ff862c` is only 2.41:1).
- **Orange as text** must be much darker in light mode (`#7f3300`, a burnt HEV tone) and a little lighter in dark mode (`#ff9b5a`) to reach 7:1.
- **Three text tiers are kept, but they are close.** At AAA, even the "muted"
  tier must reach 7:1, so the gap between tiers is small. **Hierarchy comes
  mainly from type roles** (size, weight, uppercase, mono), not from grey
  levels. To keep a visible step, secondary text was pushed further from muted
  (light `#3c332e`, dark `#cec6bc`). In light mode this replaces HL2's original
  umber `#4b423c` **[V]**, which only reached 7.89:1.
- **Status tones** keep their hues (BM's HUD amber `#e3b12c` **[V]** is still the dark-mode warning, BM blueprint `#1f4472` **[V]** is still the light-mode info) and only their lightness was moved until each reached 7:1.
- **Charcoal is a pure neutral (chroma 0)**, while bone and the other neutrals are warm (hue ≈ 50–85°). This is intentional, to keep the chosen `#1c1c1c` exact. If the dark theme feels slightly cold, give the charcoal family a little chroma (e.g. `oklch(22.6% 0.006 70)`) and re-run the contrast check.

### 3.2 Primitives

Primitives are **private**: only the applications in §3.3 reference them, never a component (the repo's own `--slate-50` → `--text-color-primary` pattern). All values are inside the sRGB gamut (no P3-only colors), so `oklch()` and hex render the same.

**HEV accent**

| Primitive (`--…`) | `oklch()` | ≈ Hex | Source | Used for |
| --- | --- | --- | --- | --- |
| `hev-50` | `oklch(96.6% 0.021 63.2)` | `#fff1e5` | [P] | light accent tint |
| `hev-200` | `oklch(82.3% 0.089 60.5)` | `#f0b88a` | [P] | light accent border |
| `hev-300` | `oklch(80.9% 0.127 56.3)` | `#ffaa6b` | **[V] HL2** | hover fill (both themes) |
| `hev-400` | `oklch(74.3% 0.174 51.8)` | `#ff862c` | **[V] HL2** | brand fill (both themes) |
| `hev-text-d` | `oklch(78.1% 0.143 52.1)` | `#ff9b5a` | [P] | dark link / focus / indicator |
| `hev-text-d-hover` | `oklch(83.2% 0.109 55.7)` | `#ffb581` | [P] | dark link hover |
| `hev-text-l` | `oklch(42.1% 0.118 46.1)` | `#7f3300` | [P] | light link / focus / indicator |
| `hev-text-l-hover` | `oklch(36.1% 0.1 46.2)` | `#662801` | [P] | light link hover |
| `hev-900` | `oklch(36.6% 0.069 55.7)` | `#5a3417` | [P] | dark accent border |
| `hev-950` | `oklch(23.6% 0.035 57.4)` | `#2b1a0d` | [P] | dark accent tint |

Black Mesa's `#e37226` **[V]** is no longer used: charcoal on it is only 5.44:1.

**Neutrals and status**

| Primitive | `oklch()` | ≈ Hex | Source | Used for |
| --- | --- | --- | --- | --- |
| `--white` | `oklch(100% 0 0)` | `#ffffff` | [P] | light card surface |
| `--bone-50` | `oklch(95.6% 0.014 84.6)` | `#f5f0e6` | [P] | light shell surface |
| `--bone-100` | `oklch(92.7% 0.02 84.6)` | `#ede6d8` | [P] chosen bone | light page · dark text |
| `--bone-200` | `oklch(88.4% 0.007 67.7)` | `#dcd8d4` | [P] | light hairline |
| `--bone-300` | `oklch(83% 0.016 73.7)` | `#cec6bc` | [P] | dark secondary text |
| `--bone-400` | `oklch(75.8% 0.02 75.3)` | `#b8afa3` | [P] | dark tertiary text |
| `--bone-500` | `oklch(55.7% 0.016 67.5)` | `#7a726a` | [P] | light control border |
| `--bone-550` | `oklch(55% 0.013 63.2)` | `#77706a` | [P] | dark control border |
| `--bone-700` | `oklch(41.1% 0.017 67.3)` | `#514941` | [P] | light tertiary text |
| `--bone-800` | `oklch(32.9% 0.016 50.9)` | `#3c332e` | [P] | light secondary text |
| `--charcoal-700` | `oklch(30.1% 0 0)` | `#2e2e2e` | [P] | dark hairline |
| `--charcoal-800` | `oklch(26% 0 0)` | `#242424` | [P] | dark card surface |
| `--charcoal-900` | `oklch(22.6% 0 0)` | `#1c1c1c` | [P] chosen charcoal | light text · dark shell |
| `--charcoal-950` | `oklch(19.1% 0 0)` | `#141414` | **[V] BM** ink-deep | dark page |
| `--green-700` | `oklch(39.8% 0.1 147.5)` | `#175525` | [P] | light success |
| `--green-300` | `oklch(74.3% 0.128 148.1)` | `#6fc27d` | [P] | dark success |
| `--amber-700` | `oklch(41.2% 0.085 78.2)` | `#644400` | [P] | light warning |
| `--amber-300` | `oklch(78.5% 0.149 86.2)` | `#e3b12c` | **[V] BM** hud-amber | dark warning |
| `--red-700` | `oklch(43% 0.175 29.5)` | `#990300` | [P] | light danger |
| `--red-300` | `oklch(79% 0.121 26.3)` | `#ff9b91` | [P] | dark danger |
| `--blue-700` | `oklch(38.4% 0.089 255.2)` | `#1f4472` | **[V] BM** blueprint | light info |
| `--blue-300` | `oklch(75.5% 0.093 253.9)` | `#86b3ea` | [P] | dark info |

### 3.3 Semantic tokens (applications)

Named by property, as in the repo: `--background-color-*`, `--text-color-*`, `--border-color-*`, `--outline-color-*`. Each one is `light-dark(var(--<light>), var(--<dark>))`, or a single primitive when it's the same in both themes. The **short name** is the label used in the contrast tables of §3.4.

| Token | **Light** | **Dark** | Short name (§3.4) | Role |
| --- | --- | --- | --- | --- |
| `--background-color-primary` | `--bone-100` (`#ede6d8`) | `--charcoal-950` (`#141414`) | `bg` | page canvas (≥640px; under 640 the page uses `secondary`) |
| `--background-color-secondary` | `--bone-50` (`#f5f0e6`) | `--charcoal-900` (`#1c1c1c`) | `surface` | shell / primary surface |
| `--background-color-tertiary` | `--white` (`#ffffff`) | `--charcoal-800` (`#242424`) | `surface-2` | cards, inset blocks, hover fills |
| `--background-color-accent` | `--hev-400` (`#ff862c`) | same | `accent` | primary CTA fill |
| `--background-color-hover-accent` | `--hev-300` (`#ffaa6b`) | same | `accent-hover` | CTA hover fill, wipe |
| `--background-color-accent-subtle` | `--hev-50` (`#fff1e5`) | `--hev-950` (`#2b1a0d`) | `accent-subtle` | `::selection`, pressed card |
| `--background-color-indicator` | `--hev-text-l` (`#7f3300`) | `--hev-text-d` (`#ff9b5a`) | `indicator` | active nav underline, card accent bar (state, so ≥ 3:1) |
| `--background-color-inverse` | `--charcoal-900` (`#1c1c1c`) | `--bone-100` (`#ede6d8`) | `inverse` | secondary button hover (inversion) |
| `--text-color-primary` | `--charcoal-900` (`#1c1c1c`) | `--bone-100` (`#ede6d8`) | `text` | primary text |
| `--text-color-secondary` | `--bone-800` (`#3c332e`) | `--bone-300` (`#cec6bc`) | `text-secondary` | role line, body copy, labels |
| `--text-color-tertiary` | `--bone-700` (`#514941`) | `--bone-400` (`#b8afa3`) | `text-muted` | metadata, captions, footer |
| `--text-color-accent` | `--hev-text-l` (`#7f3300`) | `--hev-text-d` (`#ff9b5a`) | `accent-text` | links, index numerals |
| `--text-color-hover-accent` | `--hev-text-l-hover` (`#662801`) | `--hev-text-d-hover` (`#ffb581`) | `accent-text-hover` | link hover |
| `--text-color-on-accent` | `--charcoal-900` (`#1c1c1c`) | `--charcoal-950` (`#141414`) | `accent-ink` | text/icons **on** accent fills |
| `--text-color-inverse` | `--bone-50` (`#f5f0e6`) | `--charcoal-900` (`#1c1c1c`) | `inverse-text` | text on `background-color-inverse` |
| `--text-color-success` | `--green-700` (`#175525`) | `--green-300` (`#6fc27d`) | `success` | status text/dot |
| `--text-color-warning` | `--amber-700` (`#644400`) | `--amber-300` (`#e3b12c`) | `warning` | status text/dot |
| `--text-color-danger` | `--red-700` (`#990300`) | `--red-300` (`#ff9b91`) | `danger` | status text/dot |
| `--text-color-info` | `--blue-700` (`#1f4472`) | `--blue-300` (`#86b3ea`) | `info` | status text/dot |
| `--border-color-primary` | `--bone-200` (`#dcd8d4`) | `--charcoal-700` (`#2e2e2e`) | `border` | hairlines, dividers (decorative) |
| `--border-color-strong` | `--bone-500` (`#7a726a`) | `--bone-550` (`#77706a`) | `border-strong` | control boundaries, ≥ 3:1 |
| `--border-color-accent` | `--hev-400` (`#ff862c`) | same | `accent` | system-bar HEV rule (decorative) |
| `--border-color-hover-accent` | `--hev-200` (`#f0b88a`) | `--hev-900` (`#5a3417`) | `accent-border` | card hover border (decorative) |
| `--outline-color-focus` | `--hev-text-l` (`#7f3300`) | `--hev-text-d` (`#ff9b5a`) | `focus` | focus ring |
| `--box-shadow-shell-light` / `-dark` | `0 1px 0 oklch(22.6% 0 0 / .04), 0 16px 32px -16px oklch(22.6% 0 0 / .22)` | `0 0 0 1px oklch(100% 0 0 / .02), 0 24px 48px -24px oklch(0% 0 0 / .8)` | — | floating shell only. A separate block (`settings/shadows.css` + Layout module, §9.6), because `light-dark()` takes colors only and the geometry differs |

> **Rule:** purely decorative accent strokes (the system-bar HEV rule) use `--border-color-accent` in both themes. **Anything that communicates state** (active nav underline, card hover bar) uses `--background-color-indicator`, and links and index numerals use `--text-color-accent`. Both are ≥ 7:1 against every surface in both themes.

### 3.4 WCAG contrast: computed ratios (AAA)

Computed with the WCAG 2.x relative-luminance formula from the rendered sRGB value of each `oklch()` literal. `—` means that combination isn't used. Labels are the short names from §3.3. Status colors and link hover never sit on `accent-subtle`.

**Light theme**

| Foreground | bg | surface | surface-2 | accent-subtle | Min | Level |
| --- | --- | --- | --- | --- | --- | --- |
| `text` | 13.72 | 15.00 | 17.04 | 15.40 | **13.72** | AAA |
| `text-secondary` | 9.92 | 10.84 | 12.32 | 11.13 | **9.92** | AAA |
| `text-muted` | 7.11 | 7.77 | 8.83 | 7.98 | **7.11** | AAA |
| `accent-text` | 7.12 | 7.78 | 8.84 | 7.99 | **7.12** | AAA |
| `accent-text-hover` | 9.05 | 9.89 | 11.24 | — | **9.05** | AAA |
| `success` | 7.16 | 7.83 | 8.89 | — | **7.16** | AAA |
| `warning` | 7.14 | 7.80 | 8.86 | — | **7.14** | AAA |
| `danger` | 7.14 | 7.81 | 8.87 | — | **7.14** | AAA |
| `info` | 7.95 | 8.69 | 9.87 | — | **7.95** | AAA |

| Pair | Ratio | Requirement |
| --- | --- | --- |
| `accent-ink` on `accent` | **7.06** | AAA text ✓ |
| `accent-ink` on `accent-hover` | **9.10** | AAA text ✓ |
| `border-strong` on bg / surface / surface-2 | **3.81 / 4.16 / 4.73** | UI ≥ 3 ✓ |
| `focus` on bg / surface / surface-2 | **7.12 / 7.78 / 8.84** | UI ≥ 3 ✓ |
| `inverse-text` on `inverse` | **15.00** | AAA text ✓ |

**Dark theme**

| Foreground | bg | surface | surface-2 | accent-subtle | Min | Level |
| --- | --- | --- | --- | --- | --- | --- |
| `text` | 14.84 | 13.72 | 12.50 | 13.46 | **12.50** | AAA |
| `text-secondary` | 10.90 | 10.09 | 9.19 | 9.89 | **9.19** | AAA |
| `text-muted` | 8.51 | 7.87 | 7.17 | 7.72 | **7.17** | AAA |
| `accent-text` | 8.85 | 8.19 | 7.46 | 8.03 | **7.46** | AAA |
| `accent-text-hover` | 10.69 | 9.89 | 9.01 | — | **9.01** | AAA |
| `success` | 8.50 | 7.86 | 7.16 | — | **7.16** | AAA |
| `warning` | 9.29 | 8.60 | 7.83 | — | **7.83** | AAA |
| `danger` | 9.08 | 8.40 | 7.65 | — | **7.65** | AAA |
| `info` | 8.47 | 7.83 | 7.13 | — | **7.13** | AAA |

| Pair | Ratio | Requirement |
| --- | --- | --- |
| `accent-ink` on `accent` | **7.63** | AAA text ✓ |
| `accent-ink` on `accent-hover` | **9.84** | AAA text ✓ |
| `border-strong` on bg / surface / surface-2 | **3.78 / 3.50 / 3.19** | UI ≥ 3 ✓ |
| `focus` on bg / surface / surface-2 | **8.85 / 8.19 / 7.46** | UI ≥ 3 ✓ |
| `inverse-text` on `inverse` | **13.72** | AAA text ✓ |

**Rejected pairs (why the accent rules exist)**

| Pair | Ratio | Seen at |
| --- | --- | --- |
| `#ffffff` on `#ff862c` | 2.41 | HL2 active nav |
| `#ffffff` on `#e37226` | 3.13 | BM primary CTA |
| `#1c1c1c` on `#e37226` | 5.44 | the previous light hover fill (AA only) |
| `#ff862c` on `#ffffff` | 2.41 | orange can never be light-mode text |
| `#fafafa` on `#a1a1aa` | 2.46 | LK form inputs |

### 3.5 Keeping it AAA

- **Any new color pair** needs a measured ratio ≥ 7:1 (text) or ≥ 3:1 (non-text) in **both** themes before it ships.
- **No opacity on text.** `opacity`, `/alpha` and `color-mix()` toward the background lower contrast. Use `text-muted` instead of fading `text`. Disabled controls are the one exception, because WCAG exempts inactive components.
- **Derived colors are only for non-text decoration, and only via
  `color-mix(in oklab, …)`.** Prefer an explicit token first. Per the `color`
  guide: don't derive shades by changing only the lightness with `oklch(from …)`
  (browsers don't gamut-map yet, so the result is unpredictable), and never mix
  `in oklch` with neutrals (a Chromium bug turns low-chroma colors pinkish, and
  charcoal has chroma 0). Text and focus colors are always explicit tokens with
  a measured ratio.
- **Focus Appearance (SC 2.4.13, AAA):** the 2px solid outline with 2px offset (`elements/global.css`, §9.4) surrounds the whole control, and it contrasts ≥ 7:1 with the surfaces around it, which exceeds the 3:1 change the criterion requires.
- **Other AAA criteria this design already meets:** Target Size Enhanced (2.5.5, all targets ≥ 44px), Section Headings (2.4.10, numbered section h2s), Link Purpose: Link Only (2.4.9, "Ver todo" actions carry `sr-only` context). Keep them when adding content.

---

## 4. Typography system

### 4.1 Reference fonts → license-free equivalents

| Extracted (source) | Status on page | Web equivalent | Package | Rationale |
| --- | --- | --- | --- | --- |
| **DIN Pro** Light 200 / Bold 700 / Black 900 **[HL2]** | loaded (self-hosted WOFF) | **Barlow** | `@fontsource/barlow` | Barlow is a low-contrast, slightly rounded grotesque in the DIN/industrial-signage family, and it is literally the face **[BM]** serves in place of DIN Pro. Same DNA, OFL-licensed. |
| "DIN Pro" → **Barlow** **[BM]** | DIN Pro listed but **not served**. Barlow 300–900 served | **Barlow** | same | identical to BM's real rendering |
| `apercu`, `circularstd`, `minionpro` **[HL2]** | declared, **unloaded** | — not used | — | not part of the visible voice |
| System mono stack **[BM]** | variable defined | **JetBrains Mono** (variable) | `@fontsource-variable/jetbrains-mono` | the skill's "Developer Mono" pairing. Tall x-height and clear 0/O/1/l at 12px for technical metadata. Falls back to BM's own system mono stack. |
| Manrope **[GL, LK]** | loaded | — retired | — | geometric/friendly, which conflicts with the industrial voice |

**About the `ui-ux-pro-max` recommendation.** The `--design-system` run returned
*Minimalism & Swiss Style* with **Archivo + Space Grotesk** and a monochrome +
blue (`#2563EB`) palette. The Swiss/minimal structure is kept (grid discipline,
high contrast, clear hierarchy, subtle 200–250ms hovers). The fonts and the blue
are **overridden**: Space Grotesk's quirky terminals and the blue accent are
exactly the "generic AI tech portfolio" look this brief asks to avoid, and
Barlow matches the observed DIN voice. *Optional:* **Barlow Semi Condensed 800**
for the h1 only, if you want more HL2 poster energy. It is the same family, so
there is no pairing risk.

### 4.2 Type roles

All roles are defined as tokens (`--f-*`, `--fw-*`, `--lh-*`, `--ls-*`, §9.2) and exposed as **`postcss-mixins`** (`@mixin heading-xl`, §9.3), the repo's own pattern. BM does the same job with `.type-*` classes **[V]**. Fluid sizes use `utopia.clamp(min, max)` between 360 and 448px viewports (`postcss-utopia`).

| Role (mixin) | Family | Size | Weight | Line-height | Tracking | Case | Use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `heading-xl` | Barlow | `utopia.clamp(32, 40)` → 32–40px | 800 | 1.1 | −0.005em | as written | h1 name (GL/LK/HL2 all use 40px desktop. LK mobile uses 32) |
| `heading-lg` | Barlow | `utopia.clamp(22, 24)` → 22–24px | 800 | 1.2 | 0 | sentence | section h2 (LK h2 24px) |
| `heading-md` | Barlow | 1.125rem (18px) | 500 | 1.4 | 0 | sentence | role line under name |
| `body-lg` | Barlow | `utopia.clamp(17, 18)` → 17–18px | 400 | 1.6 | 0 | sentence | bio intro paragraph |
| `body-md` | Barlow | 1rem (16px) | 400 | 1.6 | 0 | sentence | default copy. Card titles add `--fw-bold` (700, a shipped weight) |
| `label` | Barlow | 0.875rem (14px) | 700 | 1.3 | 0.06em | UPPERCASE | nav, buttons, column headings (≈ BM `.type-label-sm`: 0.875rem/900/1px) |
| `body-sm` | Barlow | 0.875rem | 400 | 1.5 | 0 | sentence | descriptions in cards |
| `micro` | JetBrains Mono | 0.75rem (12px) | 500 | 1.4 | 0.04em | UPPERCASE | indices, dates, chips, footer meta |

Rules:

- **Minimum body weight is 400.** HL2's 200 and BM's 300 body weights are atmospheric but fragile on low-DPI screens and in dark mode. This is the one place where accessibility overrides the extracted DNA.
- **Weights to ship:** Barlow 400, 500, 700, 800. Mono: variable (use 400–500 only).
- `text-wrap: balance` on `heading-xl` and `heading-lg` (BM does this **[V]**). `text-wrap: pretty` on `body-lg` / `body-md`.
- Body measure: cap paragraphs at `max-width: 62ch`. Inside a 480px shell this is naturally ~55–60ch.
- **`micro` is for metadata only**, never essential content. It is the only role under 14px.
- Numerals in mono roles are tabular by default. Add `font-variant-numeric: tabular-nums` to any Barlow numerals in rows (years, counts).
- Spanish copy: allow `hyphens: auto` on `body-sm` inside narrow bento tiles (`lang="es"` is already set).

### 4.3 Font loading in Astro (FOUT mitigation)

1. **Self-host via Fontsource** (no third-party request, no layout-blocking CSS):
   ```ts
   // src/layouts/Layout/index.astro frontmatter
   import '@fontsource/barlow/400.css';
   import '@fontsource/barlow/500.css';
   import '@fontsource/barlow/700.css';
   import '@fontsource/barlow/800.css';
   import '@fontsource-variable/jetbrains-mono';
   ```
   Fontsource CSS ships `font-display: swap`.
2. **Preload only the three critical faces** (latin 400, 700 and 800, used above the fold; 700 added 2026-11-23 because the social labels, nav and column headings use it). 500 (one role line) and mono (system bar) are not preloaded: each preload competes with the LCP portrait, and the metric-matched fallback keeps their swap stable:
   ```astro
   ---
   import barlow400 from '@fontsource/barlow/files/barlow-latin-400-normal.woff2?url';
   import barlow700 from '@fontsource/barlow/files/barlow-latin-700-normal.woff2?url';
   import barlow800 from '@fontsource/barlow/files/barlow-latin-800-normal.woff2?url';
   ---
   <link rel="preload" href={barlow400} as="font" type="font/woff2" crossorigin />
   <link rel="preload" href={barlow700} as="font" type="font/woff2" crossorigin />
   <link rel="preload" href={barlow800} as="font" type="font/woff2" crossorigin />
   ```
   Don't preload mono. It only appears in small metadata, and a swap there is harmless.
3. **Metric-matched fallback.** BM ships a generated `Barlow Fallback` face **[V]**. Do the same:
   - Generate overrides with **fontaine** (Vite plugin) or **Capsize**, or use Astro's built-in Fonts API if your Astro version provides it (it generates fallbacks automatically; check the current Astro docs).
   - Manual shape (fill the values from the tool output; don't guess them):
     ```css
     @font-face {
       font-family: "Barlow Fallback";
       src: local("Arial");
       size-adjust: /* generated */;
       ascent-override: /* generated */;
       descent-override: /* generated */;
       line-gap-override: /* generated */;
     }
     ```
   - The `--font-primary` stack (§9.2) already lists `"Barlow Fallback"` second.
4. **Normalize the fallback's x-height** with `font-size-adjust: from-font` on
   `body` (already in `elements/body.css`, §9.4), per the
   `visually-stable-font-fallbacks` guide. It is a one-line complement to the
   generated fallback face, and browsers without support ignore it. Verify it by
   blocking the Barlow files in DevTools: the text should keep roughly the same
   size and line breaks. If it doesn't, replace `from-font` with Barlow's
   measured x-height ratio.
5. Don't put `font-display: optional` on Barlow. The name in the hero should render in the brand face on first visit.
6. **Mono fallback too** (added 2026-11-23). `JetBrains Mono Fallback` faces (Capsize: JetBrains Mono over Menlo, Consolas and Courier New) sit after JetBrains Mono in `--font-mono`, so metadata, chips and repo names keep their width and line height during the swap.
7. **Subset to the page's characters** (added 2026-11-23).
   `scripts/subsetFonts.ts` runs last in the build: it collects the characters
   in the built HTML (plus CSS `content` strings, both letter cases and a small
   margin of digits, Spanish letters and punctuation) and subsets every
   Fontsource file with `subset-font`. Variable axes are kept. It renames each
   font and each stylesheet that references one by content hash, so a cached
   stylesheet never points at a font a later deploy removed. Measured: the fonts
   a visit downloads drop from about 136 KB to about 46 KB.

---

## 5. Layout, spacing & grid anatomy

### 5.1 Spacing scale (4px base)

Repo convention: `--spacing-N` = N × 4px, written as `calc(<px> * var(--rem-scale))` (§9.2). The same N is UnoCSS's spacing step (`p-4` = `gap-4` = 1rem = 16px), so layout utilities and tokens never disagree.

| Token | px | Uno equivalent | Typical use |
| --- | --- | --- | --- |
| `--spacing-1` | 4 | `p-1` | icon↔text tight |
| `--spacing-2` | 8 | `p-2` | chip gaps, icon↔label |
| `--spacing-3` | 12 | `p-3` | card inner padding (LK 12 **[V]**) |
| `--spacing-4` | 16 | `p-4` | gutter, stack gap (LK 16 **[V]**, GL `px-4` **[V]**) |
| `--spacing-5` | 20 | `p-5` | button inline padding |
| `--spacing-6` | 24 | `p-6` | hero internal groups |
| `--spacing-7` | 28 | `p-7` | chip min height |
| `--spacing-8` | 32 | `p-8` | between sections (LK 32 **[V]**), page block margin ≥640 |
| `--spacing-9` | 36 | `p-9` | theme toggle box |
| `--spacing-11` | 44 | `min-h-11` | min touch target: buttons, nav links, text actions |
| `--spacing-12` | 48 | `p-12` | page block margin ≥768 (GL `md:py-12` **[V]**, LK 48 **[V]**) |
| `--spacing-14` | 56 | `p-14` | social link min height |
| `--spacing-16` | 64 | `p-16` | footer top spacing on large screens |

Applications: `--spacing-gutter: var(--spacing-4)`, `--spacing-stack: var(--spacing-4)`, `--spacing-section: var(--spacing-8)`.

### 5.2 Page blueprint (mapped to galeed.link's real sections)

```text
 ┌───────────────────────────────── viewport (bg: primary ≥640, secondary <640) ───────────────────────┐
 │                                    ↕ page block margin (0 / 32 / 48)                                │
 │        ┌──── .shell  max-width: 30rem (480px) · --border-radius-2 · border · shell shadow ──────┐   │
 │        │ SYSTEM BAR  [mono: AR · DISPONIBLE ●]                      [ ☼/☾ theme toggle ]      │   │
 │        │━━━━━━━━━━━━━━━━━━━━━━━━━━ 2px --border-color-accent rule (HL2 nav) ━━━━━━━━━━━━━━━━━━━━│   │
 │        │ ┌──────────────────────── portrait 1:1 (5:4 <640), grayscale, fade → surface ────────┐ │   │
 │        │ └────────────────────────────────────────────────────────────────────────────────────┘ │   │
 │        │                    Galeed Gutierrez          ← h1 @mixin heading-xl                    │   │
 │        │                    Frontend developer        ← p  @mixin heading-md                    │   │
 │        │          [in LinkedIn]  [X/Twitter]  [GitHub]  [Web]   ← 4-col social row               │   │
 │        │   BIO   FREELANCE   PROYECTOS   OPEN SOURCE   CONTACTO  ← nav (scrolls; sticky)        │   │
 │        │ ─────────────────────────────────────────────── hairline                                │   │
 │        │ 01  Bio                                                                                │   │
 │        │     lead paragraph (optional)                                                          │   │
 │        │     SOBRE MÍ            │ STACK TECH                                                   │   │
 │        │     ◇ Argentina         │ [REACT] [ASTRO] [TYPESCRIPT]                                 │   │
 │        │     ◇ Tecnología …      │ [TAILWIND CSS] [NODE.JS]                                     │   │
 │        │                       ↕ 32px                                                            │   │
 │        │ 02  Trabajo freelance                                        VER TODO →                │   │
 │        │     [captura] título · meta · descripción · chips   ← tile (§7.9), full width           │   │
 │        │ 03  Side projects   → 2-col bento (featured tile spans 2)                              │   │
 │        │ 04  Open source     → tiles (§7.9), owner/repo in mono                                 │   │
 │        │ 05  Contacto        → lead + ONE primary CTA + secondary                               │   │
 │        │ ─────────────────────────────────────────────── footer (mono micro, centered)           │   │
 │        └────────────────────────────────────────────────────────────────────────────────────────┘   │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Section IDs (fixes issue 1): `#bio`, `#freelance`, `#proyectos`, `#open-source`, `#contacto`. Nav labels match the section h2 text. Suggested short nav labels: *Bio · Freelance · Proyectos · Open source · Contacto*.

> Freelance, Side projects, Open source, and Contacto had **no content on the live site** at inspection time. This document specifies their containers and components. The actual entries are content work.

### 5.3 Shell & inner grid

| Property | Value |
| --- | --- |
| Container | `--max-w-shell: calc(480 * var(--rem-scale))` (480px). Up from 448 **[GL]** / 460 **[LK]**, so a 2-col bento at 16px gutters gives 216px tiles (≥ LK's 206 **[V]**) |
| Inner gutter | `--spacing-gutter` 16px left/right for all content below the portrait |
| Section | `display: flex; flex-direction: column; gap: var(--spacing-stack)` + `scroll-margin-top: calc(var(--height-nav) + var(--spacing-4))` |
| Between sections | `var(--spacing-section)` (32px), with a hairline `border-top` on each section header except the first |
| Bento grid | `grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-3)`. Freelance, Side projects and Open source all use it. `.is-featured` → `grid-column: 1 / -1` with a 16:9 media ratio. Below 360px container width → 1 column |
| Bio spec sheet | `grid-template-columns: 1fr 1px 1fr; gap: var(--spacing-4)`. The middle track is the 1px rule. Below 360px → single column, with a horizontal hairline replacing the vertical rule |

### 5.4 Breakpoints

| Name | Min-width | Behavior |
| --- | --- | --- |
| `xs` (base) | 375px design floor (works down to 320) | shell full-bleed, radius 0, no border/shadow, body bg = `surface`. Portrait 5:4 (`object-position: 50% 20%`) so the name lands above the fold. Nav is one horizontally scrolling line, sticky at `top: 0` (§7.5). Social 4-col with icon over label |
| `sm` | `40em` (640px) | shell floats: `margin-block: var(--spacing-8)`, `--border-radius-2`, 1px `border`, shell shadow (Layout module shadows block, §9.6). Page bg = `--background-color-primary`. Portrait 1:1 |
| `md` | `48em` (768px) | `margin-block: var(--spacing-12)` (GL parity) |
| `lg` | `64em` (1024px) | no layout change, on purpose. (The section nav used to turn sticky here; since 2026-11-23 it is sticky at every width, §7.5.) |
| `xl` | `90em` (1440px) | no layout change. Verify that only the canvas grows. (BM caps its frame at 1440 **[V]**. The shell never approaches that.) |

Breakpoints are written in **`em`**, not `px` (`respect-os-text-scale`: *"Responsive breakpoints MUST NOT assume that text will remain at its default size"*). The pixel values in parentheses are at the default 16px text size. When someone enlarges their text, the layout switches as if the screen were narrower, so the larger text still fits.

> The large breakpoints change little on purpose. A link hub should not turn into a dashboard at 1440px. Design effort goes into the 375–640 range, where most traffic lands.

### 5.5 Z-index scale

`--z-index-0: 0` · `--z-index-10-sticky-nav: 10` (sticky nav) · `--z-index-50-overlay: 50` (reserved) · `--z-index-100-skip-link: 100` (skip link)

---

## 6. Surfaces, borders, elevation & Half-Life micro-details

### 6.1 Radius ("machined", not bubbly)

Both Half-Life references use **0 radius** **[V]**. GL/LK use 16px shells and 8px items **[V]**. The compromise is tight radii that read as precision-cut.

| Token | Value | Applies to |
| --- | --- | --- |
| `--border-radius-0` | 0 | rules, system bar, portrait on mobile |
| `--border-radius-05` | 2px | buttons, chips, the theme toggle, inputs |
| `--border-radius-1` | 4px | tiles and their media |
| `--border-radius-2` | 8px | floating shell (≥640) |
| `--border-radius-circle` | 50% | status dots and avatar thumbnails only |

### 6.2 Borders

| Token | Value | Use |
| --- | --- | --- |
| `--border-025` | 1px | all dividers, card outlines, shell outline (HL2 `hr`/table cells/footer columns are 1px **[V]**) |
| `--border-05` | 2px | system-bar accent rule (HL2 nav `border-bottom: 2px` **[V]**), active indicators (BM underline `h-0.5` = 2px **[V]**) |

Colors: `--border-color-primary` (decorative), `--border-color-strong` (controls), `--border-color-hover-accent` (hover), `--border-color-accent` (the decorative HEV rule). Active indicators are filled shapes in `--background-color-indicator` (see the rule in §3.3).

### 6.3 Elevation

Elevation is flat by default.

| Level | Token | Where |
| --- | --- | --- |
| 0 | none | everything, including cards (borders define them, not shadows) |
| 1 | `--box-shadow-shell-light` / `-dark` | the floating shell at ≥640px (set by the Layout module's shadows block, §9.6, not a utility) |

No glows or colored shadows. Linkd's inset "pillow" card shading **[V]** is skeuomorphic and is not carried over.

### 6.4 Curated Half-Life micro-details (use these, sparingly)

1. **HEV rule.** A 2px `--border-color-accent` line under the system bar (from HL2's nav `border-bottom: 2px solid #ff862c` **[V]**). It is the only full-width accent stroke on the page.
2. **Section indices.** A mono `01`–`05` in `--text-color-accent` before each section h2. This is editorial numbering, not a HUD readout.
3. **Em-dash attribution labels.** Uppercase accent labels prefixed with "—", as in BM's `—EUROGAMER` **[V]**. Use them for testimonial/client credits in the Freelance section, if quotes are added.
4. **Hairline spec sheet.** The Bio's vertical 1px rule between columns, already present in GL **[V]**. HL2's footer columns use the same device **[V]**.
5. **Tracked uppercase labels.** Nav, buttons, and column headings at 0.06em tracking (≈ the 1px/17px used on both HL sites **[V]**).
6. **Accent underline grow.** Nav indicator `scaleX(0→1)`, origin left, 300ms (BM **[V]**).
7. **Diagonal wipe (opt-in, one element).** HL2's `skew(-33deg)` fill sweep **[V]**, allowed **only** on the single primary Contacto CTA.
8. **Technical metadata.** Mono micro strings for location/availability in the system bar, year ranges on cards, `owner/repo` names. Real data only.
9. **λ glyph (optional, once).** A single text lambda (`λ`, Unicode U+03BB, `aria-hidden="true"`) as a footer separator. Use it at most once on the page.

### 6.5 Boundaries: do NOT

- Use Valve/Half-Life/Black Mesa logos, the circled-lambda mark, the Combine/HEV iconography, or game screenshots.
- Add scanlines, CRT curvature, noise/grunge textures, glitch effects, neon glow, or text-shadow.
- Add HUD brackets, crosshairs, corner ticks on cards, fake "SYSTEM ONLINE" boot text, or typewriter animations.
- Use orange as a large background area (beyond the CTA button) or for body text in light mode.
- Use more than **one** accent hue. Status colors exist for status only.
- Use purple/blue gradients, glassmorphism, or blur backdrops.

### 6.6 Forced Colors Mode (Windows high contrast)

In forced colors the browser replaces author colors with the user's system palette and removes `box-shadow` and gradient backgrounds. The `color` guide's rule: *"Don't rely on `background-image`, `box-shadow`, or `border-image` to convey borders, separators, or state"*. What changes (each atom's or module's `@media (forced-colors: active)` block, §9.5–§9.6):

| Element | Normal | Forced colors |
| --- | --- | --- |
| Nav underline (`::after`) | `background` bar | `border-block-end` in `CanvasText`. The current section uses `Highlight` |
| Card accent bar (`::before`) | `background` bar | `border-inline-start` in `Highlight` |
| Theme toggle | border + icon | kept automatically (`ButtonFace` / `ButtonText`). The state is the icon's shape (sun/moon), not a color, so nothing needs redrawing |
| Status chip dot | `background: currentColor` | `CanvasText` dot. The text label still carries the meaning |
| Portrait fade, shell shadow | gradient / shadow | removed. Both are decorative, so nothing is lost |
| Focus ring, borders, chips | `outline` / `border` | kept automatically, in system colors |

`forced-color-adjust: none` is used only where color is the information (the status dot), never to preserve the look.

---

## 7. Component specifications

Conventions (§9):
- **Layout** (display, flex/grid, gap, padding/margin, sizing, position, aspect ratio) is written with **UnoCSS utilities**, shown in `class="…"`.
- **Everything visual** comes from tokens (§9.2), type mixins (`@mixin heading-xl`, §9.3), global atoms (`a-*`, BEM, §9.5) or the component's **CSS Module** (shown as `styles.name`, §9.6).
- **Hit area** means the minimum interactive box. The page targets ≥44×44px on touch, and never goes below WCAG 2.2's 24×24.

### 7.1 Skip link

- `<a href="#main" class="skip-link a-button a-button--primary">Saltar al contenido</a>`, the first focusable element (BM has one **[V]**).
- `.skip-link` (utilities, §9.4) keeps it visually hidden until `:focus-visible`. Then it is fixed top-left at `var(--spacing-2)`, with `z-index: var(--z-index-100-skip-link)`.

### 7.2 System bar + theme toggle

**Anatomy**

```text
┌───────────────────────────────────────────────────────────────┐
│ AR · DISPONIBLE ●                                     [☼]     │  h 48px, px --spacing-gutter
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘  2px --border-color-accent (decorative)
```

- Container: `<div class:list={['flex items-center justify-between min-h-12 px-4', styles.bar]}>`. The module adds `background-color: var(--background-color-secondary)` and `border-block-end: var(--border-05) solid var(--border-color-accent)`.
- Left: `@mixin micro`, `color: var(--text-color-tertiary)`.
  - The optional availability dot is `--text-color-success` plus text, never the dot alone.
  - Long strings truncate with `min-inline-size: 0; text-overflow: ellipsis`, and the full text is also in the hero. Keep it short.
- **Theme toggle (one button, two states):** the decision was two states. A toggle that sits permanently in the site chrome is a quick comfort adjustment ("too bright right now"), not a long-term setting. Two states cover that without giving up the return to System. The behavior is in §2.1 rules 4–5 and §2.3.
  ```astro
  <button type="button" class:list={['grid place-items-center size-9', styles.toggle]} data-theme-toggle hidden>
    <span data-when="light">
      <Icon name="lucide:sun" aria-hidden="true" /><span class="sr-only">Cambiar a tema oscuro</span>
    </span>
    <span data-when="dark">
      <Icon name="lucide:moon" aria-hidden="true" /><span class="sr-only">Cambiar a tema claro</span>
    </span>
  </button>
  ```
  - **Icon = the theme rendered now** (sun in light, moon in dark), and that includes System: it shows the theme the OS resolves to. **The accessible name = the action** ("Cambiar a tema oscuro").
  - Both states are in the markup. The module hides the inactive one with `display: none`, keyed on `:root[data-theme]` (§9.6). This also drops the stale label from the accessibility tree, so no JS is needed to keep the name current when the OS theme changes.
  - **No `aria-pressed`.** The name is already an action, and "pressed" plus "Cambiar a tema oscuro" would contradict itself.
  - A native `<button>` gives one tab stop, Enter/Space activation, and focus for free.
  - `hidden` is removed by the module script, so no-JS users never see a dead control.
  - Box: `size-9` (36px visual). The module adds `border: var(--border-025) solid var(--border-color-strong)`, `border-radius: var(--border-radius-05)`, `background-color: var(--background-color-tertiary)`, and an `::after { inset: -4px }` that extends the hit area to 44px. Icon 16px, `color: var(--text-color-tertiary)`.
  - **States:**
    - Hover: icon → `--text-color-primary`.
    - Focus-visible: the global focus ring (§9.4).
    - Active: `translate: 0 1px`.
    - The current theme is not a "selected" state. The whole page is the feedback.
  - Tooltip-free. The `sr-only` names carry the meaning. Don't add a static `title`: it would have to change with the state, which needs JS.
  - Returning to System doesn't need its own option. When the user flips back to the OS theme, the override is cleared (§2.1 rule 4). If the site ever gets a settings panel, *that* is the place for an explicit three-option control (Sistema / Claro / Oscuro), with "Sistema (ahora: claro)".

### 7.3 Profile / hero header

| Part | Spec |
| --- | --- |
| Portrait | `<Picture>` from `astro:assets` (AVIF/WebP, `widths=[375,480,960]`, `sizes="(min-width: 40em) 480px, 100vw"`), explicit `width/height`. `aspect-[5/4] sm:aspect-square`. Module: `object-fit: cover; object-position: 50% 20%`. Grayscale photo kept as-is (GL/LK **[V]**). No tint, no duotone. **Eager** load + `fetchpriority="high"` (it is the LCP element). |
| Fade | `::after` overlay in the module: `linear-gradient(to bottom, transparent 55%, var(--background-color-secondary))`. Theme-aware automatically |
| Radius | `--border-radius-0` (it sits under the system bar inside the shell, and the shell clips it) |
| Name | `<h1 class={styles.name}>`: the `h1` element default (`@mixin heading-xl`, §9.4), plus `text-align: center` and `margin-block-start: calc(var(--spacing-6) * -1)`, so it overlaps the fade slightly (GL/LK pattern) |
| Role | `<p class={styles.role}>`: `@mixin heading-md`, `color: var(--text-color-secondary)`, centered (**not** a heading, fixes issue 5) |
| Spacing | name → role `--spacing-2`, role → social `--spacing-6`, social → nav `--spacing-6` (Uno `mt-2`, `mt-6`) |
| Text resilience | `heading-xl` is balanced. Long names wrap to 2 lines and never shrink below the clamp floor. `overflow-wrap: anywhere` on the role line only |

### 7.4 Social link row

- `<ul class="grid grid-cols-4 gap-2 px-4" role="list">`. Each item is `<a class:list={['flex flex-col items-center justify-center gap-1 min-h-14', styles.link]}>`, with an **icon above a visible label** (GL pattern **[V]**, kept over LK's icon-only row).
- Module `.link`: `@mixin label` (uppercase 14px, so "LINKEDIN" fits ~85px tiles at 375), `color: var(--text-color-secondary)`, `border-radius: var(--border-radius-05)`.
- Icons: 20px. **Brand marks come from Simple Icons** (`simple-icons:linkedin`, `simple-icons:x`, `simple-icons:github`) via `astro-icon`, because Lucide has deprecated its brand icons. Use `lucide:globe` for "Web". Icons get `aria-hidden="true"` because the label names the link.
- External links: `target="_blank" rel="me noopener"` plus `<span class="sr-only">(se abre en una pestaña nueva)</span>`.
- States: hover → `--text-color-accent`. Focus-visible → global ring. Active → `translate: 0 1px`.
- Content suggestion: rename "Twitter" → "X" only if the profile URL stays `x.com` (it is `x.com/gutierrezgaleed` today **[V]**).

### 7.5 Section navigation

- `<nav aria-label="Secciones"><ul class="flex flex-wrap justify-center gap-x-1 px-4" role="list">`.
- Link: `<a class:list={['relative inline-flex items-center min-h-11 px-3', styles.link]}>`. The module adds `@mixin label` and `color: var(--text-color-secondary)`.
- Indicator (BM **[V]**): `::after` with `inset-inline: var(--spacing-3)`, `inset-block-end: var(--spacing-2)`, `block-size: var(--border-05)`, `background-color: var(--background-color-indicator)`, `scale: 0 1`, origin left. It grows over `--duration-slow` / `--ease-out` only under `no-preference` (code in §9.6).
- States: hover → `--text-color-primary` + indicator `scale: 1`. **Current
  section** (`aria-current="true"`, set by a rAF-throttled scroll check: the
  last section whose heading reached its `scroll-margin-top` line + 24px; at the
  page bottom the last link; a clicked link stays current until the user
  scrolls. An IntersectionObserver band was dropped because anchor jumps skip
  over it, and short final sections never reach it) → `--text-color-primary` +
  indicator fully shown. Focus-visible → global ring.
- **One scrolling line, with an affordance** (fixes issue 2 without wrapping; the owner prefers the original scrolling nav, 2026-11-23).
  - `ul.navbar__list`: `overflow-x: auto`, `py-1` so the focus ring isn't clipped, inline padding 16px / 32px matched by `scroll-padding-inline`.
  - A `mask-image` fades both edges over that padding only, so the first and last links are never covered at the scroll ends.
  - Scrollbar hidden on touch; `scrollbar-width: thin` under `(hover: hover) and (pointer: fine)`, so mouse users can reach the last links.
  - The current link is scrolled into view inside the list (never the page) when the observer marks it.
- Sticky at every width: `sticky top-0` (owner's choice, 2026-11-23; it used to
  be ≥1024px only, which left phones without it). It is one row of about 52px,
  under 12% of a phone's viewport. The module adds
  `background-color: var(--background-color-secondary)`, a `--border-025` bottom
  hairline in `--border-color-primary`, and
  `z-index: var(--z-index-10-sticky-nav)`. `--height-nav` keeps anchored
  headings clear via `scroll-margin-top`.

### 7.6 Section header

```text
───────────────────────────────────────────────  (top hairline; omitted on first section)
01  Trabajo freelance                    VER TODO →
```

- `<header class:list={['flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-6', styles.head]}>`. The module adds `border-block-start: var(--border-025) solid var(--border-color-primary)`.
- Title: `<h2><span class={styles.index} aria-hidden="true">02</span>Trabajo freelance</h2>`.
  - `h2` uses its element default, `@mixin heading-lg`.
  - `.index` is `@mixin micro`, `color: var(--text-color-accent)`, `margin-inline-end: var(--spacing-2)`.
- Optional action: `a-link-action` (§9.5). It is `@mixin label` with `--text-color-accent` and a trailing `lucide:arrow-right` 16px that nudges 2px on hover, per BM **[V]**. Its accessible name must be specific, e.g. `<span class="sr-only">Ver todos los </span>proyectos`.
- The heading never truncates. It wraps, balanced. If the action plus the title don't fit, the action drops below (`flex-wrap`).

### 7.7 Badges / chips

<!-- markdownlint-disable MD013 -->

| Variant | Spec |
| --- | --- |
| **Tech chip** (non-interactive) | Atom `a-chip` (§9.5). It's an inline flex row with a 6px gap, `min-block-size: var(--spacing-7)`, `padding-inline: var(--spacing-2)`, `--border-radius-05`, a `--border-025` border in `--border-color-primary`, and `--background-color-tertiary`. Type: `@mixin micro` in `--text-color-secondary`, `white-space: nowrap`. Optional 14px Simple Icons logo (`aria-hidden`) |
| **Status chip** | `a-chip a-chip--success` (or `--warning` / `--info` / `--danger`) + a leading `<span class="a-chip__dot">` (6px, `--border-radius-circle`, `currentColor`). The label always states the status ("EN CURSO", "ACTIVO", "ARCHIVADO"). Color is never the only signal |
| **Collection** | `<ul class="flex flex-wrap gap-2" role="list">`. **Wrap the collection before shrinking labels** (skill: `chip-collection-reflow`). No `+n` hiding on this site (≤8 chips per group) |
| Long values | Chips stay single-line. If an unpredictable value could overflow (e.g. a repo topic), wrap the text in `<span class="a-chip__label">` (ellipsis, `min-inline-size: 0`), and show the full value in the card body |

<!-- markdownlint-enable MD013 -->

### 7.8 Link card (retired)

Freelance used a 56px link card (LK geometry **[V]**: index, title, meta row,
trailing arrow, accent bar). Since 2026-11-24 freelance and open source use the
tile (§7.9), so every project shows its screenshot and description. The owner
chose it over a thumbnail inside the link card, which shrank the screenshot.
`LinkCard` and `RepoCard` were removed with it.

### 7.9 Project / bento card (Freelance, Side projects, Open source)

- Grid: §5.3. The card is an `<a class:list={['flex flex-col gap-2', styles.tile]}>`, with `--border-radius-1` and `--text-color-primary`. There is no border around the whole tile, following LK's open style **[V]**.
- Media: `<Picture>` in a
  `<figure class:list={['relative overflow-hidden aspect-video', styles.media]}>`
  on every tile, featured or not. The project screenshots are 16:10 (2560×1600
  PNGs since shared-assets 0.4.0), so `object-top` crops only their bottom
  strip; a square crop cut them to a third of their width and upscaled them. The
  `<picture>` wrapper gets `pictureAttributes={{ class: 'block h-full' }}`, so
  `object-fit: cover` fills the frame. The fallback `<img>` is capped at
  `width={960}`; without it, it is the full-size PNG.
  The module adds `--border-radius-1`, a `--border-025` border in
  `--border-color-primary`, and `--background-color-tertiary`. Images use
  `loading="lazy"` and explicit dimensions (CLS < 0.1).
  - Hover: `img { scale: 1.03 }` over 300ms (BM uses 1.05 **[V]**; reduced here to stay subtle).
- Title: `@mixin body-md var(--fw-bold)` (LK uses 18/500 **[V]**). Meta: `@mixin micro`, `--text-color-tertiary` (stack · year).
- Description (optional): `@mixin body-sm`, `--text-color-secondary`, `line-clamp-3`. The full text lives on the project page, so the clamp is acceptable.
- Focus-visible: ring on the `<a>` (wraps the media). `outline-offset: 2px` keeps it visible around the image.
- Missing image: a `--background-color-tertiary` block with the project initial in `@mixin heading-xl` and `--text-color-tertiary`. Never collapse the tile height.
- Chips (optional): a `flex flex-wrap gap-2` row of §7.7 chips under the
  description, status first (freelance: status + "Privado"; open source:
  status, language, `PR #n`).
- Private work (no `href`): the root is an `<article>` instead of an `<a>`, with
  no new-tab text. The image zoom is scoped to `.tile-card:any-link`, so the
  static tile never reacts to hover.
- Each section's first tile is featured (`col-span-full`). With one project per
  section, freelance and open source show a single full-width tile.

### 7.10 Open source tile

- The §7.9 tile. Title: `owner/repo` with `.tile-card__title--code`
  (`font-family: var(--font-mono)`, `font-size: var(--f-body-sm)`,
  `font-weight: var(--fw-medium)`, `overflow-wrap: anywhere`).
- Description: the pull request title, or the project description when there
  is no PR. The tile links to the PR, or to the repo.
- **Stars/forks only if fetched at build time** (e.g. GitHub API during `astro build`, with a graceful fallback that omits them). Never hard-code numbers that go stale.

### 7.11 Buttons & CTAs

| Variant | Spec |
| --- | --- |
| **Primary** (`a-button a-button--primary`) | 44px min height, `--spacing-5` inline padding, `--border-radius-05`, `@mixin label`. Fill `--background-color-accent`, text `--text-color-on-accent`. Hover: `--background-color-hover-accent`. Active: `translate: 0 1px`. **One per page:** the Contacto CTA ("Escribime" → `mailto:`) |
| **Primary + wipe** (`… a-button--wipe`, opt-in on that same CTA) | `::before` in `--background-color-hover-accent`, `skewX(-33deg) translateX(-110%)` → `translateX(-10%)` on hover/focus-visible (HL2 **[V]**). The `::before` exists only under `no-preference`. Under reduced motion, the base hover fill applies |
| **Secondary** (`a-button a-button--secondary`) | transparent fill, `--border-color-strong` border, `--text-color-primary`. Hover: **inversion** to `--background-color-inverse` + `--text-color-inverse` (BM `hover:bg-white hover:text-ink` / HL2 `.inverted` **[V]**) |
| **Text action** (`a-link-action`) | inline flex, 6px gap, 44px min height, `@mixin label`, `--text-color-accent`. Hover: `--text-color-hover-accent` + icon nudge (`a-link-action__icon`) |
| Inline prose link | a bare `<a>` with no class: `elements/link.css` gives it `--text-color-accent` and a 1px underline at a `0.2em` offset. Hover: `--text-color-hover-accent` and a 2px underline. Components always set a class, so they opt out |
| Disabled (any) | `aria-disabled="true"` (or `disabled` on `<button>`), `opacity: 0.45`, `cursor: not-allowed`, no hover change |
| Loading (if a form is ever added) | keep the width, swap the icon for a 16px spinner, `aria-busy="true"`, disable until resolved |

All buttons: labels never wrap mid-word. Allow two-line labels only on mobile via `text-wrap: balance`, and never truncate. Icon-only buttons need `aria-label`.

### 7.12 Contacto section

- A `@mixin body-lg` sentence in `--text-color-secondary`, then a button row `class="flex flex-wrap gap-3"`:
  - **Primary** "Escribime" (`mailto:`);
  - **Secondary** "LinkedIn" or "Agendar llamada".
- **No form by default.** A static mailto keeps the hub dependency-free. If a form is added later:
  - follow the skill's form rules: visible labels, inline errors with `aria-describedby`, an error summary, 44px inputs, and no LK-style low-contrast fills;
  - update the repo's `a-input` atom to these tokens. It currently uses undefined variables (§9.1).

### 7.13 Footer

- `<footer class:list={['mt-8 px-4 pt-8 pb-4', styles.footer]}>` (LK `32px 16px 16px` **[V]**). The module adds a `--border-025` top hairline in `--border-color-primary` and `text-align: center`.
- Lines are `@mixin micro`, `--text-color-tertiary`: `© 2026 Galeed Gutierrez` · `Hecho con Astro` · optional `λ` separator (`aria-hidden`).
- "Volver arriba" is an `a-link-action` targeting `#top`. Add `rel="me"` profile links if they aren't already in the hero.
- Links inside are `--text-color-secondary`, with hover → `--text-color-accent` (HL2 footer hover → orange **[V]**).

### 7.14 Bio block

- Optional lead: `<p class={styles.lead}>`: `@mixin body-lg`, `--text-color-secondary`, `max-inline-size: var(--max-w-measure)`.
- Spec sheet: `<div class="grid grid-cols-[1fr_1px_1fr] gap-4">` (§5.3) with two `<section>` columns. Each column has an `<h3>` "SOBRE MÍ" / "STACK TECH". The `h3` element default is `@mixin label`, and the module sets `--text-color-tertiary`.
  - The columns are separated by `<div class={styles.rule} aria-hidden="true">`, a 1px track in `--border-color-primary`.
- *Sobre mí:* `<ul class="flex flex-col gap-2" role="list">`, items `class="inline-flex gap-2 items-start"` in `@mixin body-md`, each with an 18px Lucide icon in `--text-color-tertiary`, `aria-hidden`. Suggested mapping:
  - Argentina → `lucide:map-pin`
  - Tecnología → `lucide:cpu`
  - Gym → `lucide:dumbbell`
  - Hiking → `lucide:mountain`
  - Juegos de mesa → `lucide:dices`
  - Mate → `lucide:leaf`
  - Café → `lucide:coffee`
- *Stack tech:* a chip collection (§7.7). "Frontend Developer" moves out of the list (it is already the role line). This also removes the awkward mobile wrap (issue 7).

### 7.15 404 page

- `src/pages/404.astro`: the system bar in a `<header>`, then `NotFound` in `<main>`. `noindex`.
- Flow, left-aligned: illustration → mono tag (`@mixin micro`, `--text-color-accent`; the visible `ERR_404 // RUTA_NO_RESUELTA` is `aria-hidden`, an `sr-only` twin reads "Error 404: ruta no resuelta") → `h1` → `@mixin body-md` text in `--text-color-secondary` → one `a-button a-button--primary` back to `/`.
- Illustration (`NotFound/Illustration.astro`): inline SVG line art, `role="img"` named by its Spanish `<title>` and `<desc>`.
  A "404" browser window on legs walks up to a booth drawn in the same flat window style: a dark header that carries the "ANOMALOUS LINK" sign, a service window and a counter. A generic guard, built from basic shapes, looks on from inside. No game names, logos or characters (§6.5).
  - No color in the markup. Line art is `--text-color-primary` through `currentColor`. Fills are background tokens (`tertiary` surfaces, `primary` service window, `inverse` for both title bars, the cap and one sneaker). The single accent is the browser window's 2px HEV rule in `--border-color-accent`.
  - SVG text: sign `@mixin micro` in `--text-color-inverse` on the inverse header (15.00 / 13.72:1), "404" `@mixin heading-xl` in `--text-color-accent` on tertiary (8.84 / 7.46:1).
  - Forced colors map each fill role to `Canvas` / `CanvasText` and the HEV rule to `Highlight`.
- Motion: the one-pass walk-in in §8.2.

---

## 8. Motion & interaction guidelines

### 8.1 Tokens (aligned with extracted timings)

| Token | Value | Basis |
| --- | --- | --- |
| `--duration-instant` | 100ms | press feedback |
| `--duration-fast` | 150ms | color hovers on nav/text (BM `transition-colors .15s` **[V]**) |
| `--duration-base` | 200ms | buttons, card border/bg (HL2 & BM 200ms **[V]**) |
| `--duration-slow` | 300ms | indicator grow, wipe, media scale (BM underline 300ms, HL2 wipe 300ms **[V]**) |
| `--ease-standard` | `cubic-bezier(.4, 0, .2, 1)` | BM default **[V]** |
| `--ease-out` | `cubic-bezier(0, 0, .2, 1)` | BM `--ease-out` **[V]**. Entering/growing |
| `--ease-in` | `cubic-bezier(.4, 0, 1, 1)` | [P] exits (use ~70% of the enter duration) |

### 8.2 Behaviors

| Interaction | Property | Duration / easing |
| --- | --- | --- |
| Link/text color hover | `color` | fast / standard |
| Card hover | `border-color`, `background-color` | base / standard |
| Card accent bar, nav underline | `transform: scaleY/scaleX` | slow / out |
| Arrow nudge | `transform: translateX(2px)` | base / out |
| Bento media zoom | `transform: scale(1.03)` | slow / out |
| Primary CTA wipe | `transform` on `::before` | slow / out |
| Press | `transform: translateY(1px)` | instant / standard |
| Theme switch | **no transition** (suppressed 2 frames) | — |
| Anchor scroll | `scroll-behavior: smooth` only under `prefers-reduced-motion: no-preference` | — |
| 404 walk-in (§7.15) | `transform` on the walker, its card and legs. Plays once on load, then rests on the static pose | 2.4s in total (4 × 0.6s steps), out / standard. Under 5s, so WCAG 2.2.2 needs no pause control |

Rules:

- **Animate only `transform`, `opacity`, `color`, `background-color`, `border-color`.** Never width, height, top, or left.
- **At most 1–2 moving elements per interaction.** No page-load choreography, staggered reveals, or scroll-triggered entrances. **All content is visible at first paint** (avoids LK's blank-until-scrolled sections). This deliberately declines the skill's optional GSAP scroll-reveal, because the dependency weight isn't justified for this page.
- **Cancellable:** hover-out reverses mid-flight (CSS transitions do this natively). The JS theme logic never waits on `transitionend`.
- Hover effects always have a `:focus-visible` twin. Nothing is hover-only.
- `touch-action: manipulation` on interactive elements. Add `@media (hover: hover)` guards on hover transforms so taps don't leave sticky hover states.

### 8.3 Reduced motion

There is **no global kill switch** (no `transition-duration: 0.01ms` on `*`). The `motion` guide is explicit: *"DO NOT globally apply `animation-duration: 0.01ms;`"*. A global override can make some animations more jarring, and it also removes harmless color feedback. Instead, each moving effect opts in to motion next to its own rule (§9.5–§9.6):

| Effect | `no-preference` | `reduce` |
| --- | --- | --- |
| Nav underline, card accent bar | grow over 300ms | **appear instantly** (final state kept, no transition) |
| Arrow nudge, media zoom | animated | dropped entirely |
| Primary CTA diagonal wipe | animated | dropped. The plain hover fill applies |
| Color / background / border changes | 150–200ms | **unchanged**. They aren't motion |
| Anchor scrolling | smooth | instant |
| 404 walk-in | plays once (2.4s) | dropped. The static pose is the final frame |
| Theme switch | instant | instant |

Pattern: declare the static state by default, and add the transition inside a nested `@media (prefers-reduced-motion: no-preference)` block in the same rule. Code that waits for `transitionend` must not exist, because under `reduce` that event never fires (the theme logic in §9.8 doesn't use it).

---

## 9. Astro + ITCSS + TypeScript implementation blueprint

This section follows the way the galeed.link repository already organizes CSS. That's **verified** by reading `src/styles`, `postcss.config.js`, `scripts/` and `package.json` at commit `d8011c7`. These are the conventions this section keeps:

| Convention in the repo **[V]** | Kept as |
| --- | --- |
| ITCSS folders (`settings`, `tools`, `generic`, `elements`, `atoms`, `utilities`), each with an `index.css` of `@import`s | same folders. Utilities move to the **end** of the import order (§9.1) |
| Primitives (`--slate-50`) + applications by property (`--text-color-primary: light-dark(…)`) | same pattern, with this palette (§9.2) |
| Pixel values written as numbers × `--rem-scale` (`calc(16 * var(--rem-scale))`) | same |
| Fluid sizes with `utopia.clamp(min, max)` (`postcss-utopia`, 360–448px) | same |
| Type roles as `@define-mixin` (`postcss-mixins`) | same, one mixin per role (§9.3) |
| Atoms as BEM with an `a-` prefix (`.a-button--primary`, `.a-input__error-message`) | same (§9.5) |
| One `styles.module.css` per Astro component | same (§9.6) |
| Reset inside `@layer reset` | same, with two accessibility fixes (§9.4) |
| UnoCSS installed (`@unocss/astro`) | **layout only** (§9.7) |

File layout:

```text
src/
  styles/
    index.css                      ← §9.1 import order
    settings/   index.css  colors.css  shadows.css  typography.css  layout.css  motion.css  z-index.css   ← §9.2
    tools/      index.css  typography.css                                                              ← §9.3
    generic/    index.css  light-reset.css                                                             ← §9.4
    elements/   index.css  html.css  body.css  headings.css  link.css  global.css                     ← §9.4
    atoms/      index.css  a-button.css  a-link-action.css  a-chip.css                                 ← §9.5
    utilities/  index.css  a11y.css  theme.css                                                         ← §9.4
  components/<Name>/index.astro + styles.module.css   ← §9.6
  layouts/Layout/index.astro + styles.module.css      ← head script §2.2, fonts §4.3, shell §9.6
  scripts/theme.ts                                    ← §9.8
  types/design-tokens.ts                              ← §9.9
uno.config.ts                                         ← §9.7
postcss.config.js · scripts/purgeCss.ts · scripts/lightningcss.ts   ← §9.1
```

### 9.1 Import order & build pipeline

`src/styles/index.css`:

```css
/* Settings: custom properties only (no selectors besides :root) */
@import "./settings/index.css";

/* Tools: mixins (they produce no CSS on their own) */
@import "./tools/index.css";

/* Generic: reset, in @layer reset */
@import "./generic/index.css";

/* Elements: bare HTML elements */
@import "./elements/index.css";

/* Atoms: global a- blocks */
@import "./atoms/index.css";

/* Utilities: last, so they win (ITCSS order) */
@import "./utilities/index.css";
```

> **[P] Order change:** the repo imports utilities *before* atoms. ITCSS puts utilities last, so a helper like `.sr-only` or `.skip-link` beats any atom it is combined with (`.skip-link.a-button`, §7.1).

`postcss.config.js` (one change: `mixinsFiles`):

```js
import cssnano from 'cssnano';
import postcssCustomProperties from 'postcss-custom-properties';
import postcssMixins from 'postcss-mixins';
import postcssUtopia from 'postcss-utopia';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    // CSS Modules and atoms can call @mixin heading-xl etc. without importing tools/.
    postcssMixins({ mixinsFiles: './src/styles/tools/*.css' }),
    postcssCustomProperties({ preserve: false }),
    postcssUtopia({ minWidth: 360, maxWidth: 448 }),
    cssnano({ preset: ['advanced', {}] }),
  ],
};

export default config;
```

`.stylelintrc.json` (**[P] change**): let stylelint know the mixin at-rules, instead of a disable comment in every file that calls one:

```json
"at-rule-no-unknown": [true, { "ignoreAtRules": ["define-mixin", "mixin"] }]
```

> **stylelint autofix is expected.** `lint-staged` runs `stylelint --fix`, which reorders properties (`order/properties-order`), lowercases system colors (`CanvasText` → `canvastext`), and writes alpha as a percentage (`/ 0.04` → `/ 4%`). The CSS in this document already uses range media queries (`width >= 40em`) and puts at-rules last, so the fixes are cosmetic.
>
> **[P] Why `mixinsFiles`:** without it, postcss-mixins only knows the mixins defined in the file being processed. That works for `index.css`, which `@import`s `tools/`. Each `styles.module.css` is processed on its own, so a `@mixin heading-xl` there would not exist. Check the option name against your installed `postcss-mixins` version.

`package.json` build order (**[P] change: lightningcss last**):

```json
"build": "astro build && npm run purge-css && npm run lightningcss"
```

`scripts/purgeCss.ts` safelist (**[P] change**). Keep your list and add these two entries:

```ts
safelist: {
  standard: [
    /^data-theme/,   // data-theme, -pref, -switching, -toggle: set at runtime by theme.ts
    'aria-current',  // set by the section nav scrollspy (§7.5)
    // …your existing entries
  ],
  // …
},
```

**Verified behavior of this pipeline:**

- **`postcss-custom-properties({ preserve: false })`:** replaces every `var(--background-color-primary)` of a variable defined in `:root` with its value, here `light-dark(var(--bone-100), var(--charcoal-950))` with the primitives resolved too. That is harmless, because `light-dark()` resolves against the element's `color-scheme` at runtime wherever it ends up.
  - It only reads `:root`/`html` (README, v15.0.5). So a token **redefined under another selector would be inlined to its `:root` value**. Themed values are never overridden per selector: they live in `light-dark()`, or the final property is set directly (shadows, §9.6).
  - In CSS Modules the `var()` isn't inlined, because the variable is defined in another file. It resolves at runtime from `:root`, so it still works.
- **lightningcss targets: the `browserslist` field of `package.json`, `baseline widely available with downstream`** (owner's choice, 2026-11-24). In November 2026 that is Chrome/Edge 125+, Firefox 126+, Safari/iOS 17.5+, Samsung Internet 27+ and Opera 111+. Every one supports `light-dark()`, `oklch()` and nesting, so lightningcss passes them through: no `--lightningcss-light/dark` polyfill, no hex fallbacks, nesting kept (about 6 KB less CSS before compression). cssnano's autoprefixer reads the same field.
  - The polyfill only returns if the targets include a browser without `light-dark()` (Safari/iOS 16.5–17.4 was the reason under the old `>= 0.25%, not dead, supports css-nesting` query). It then keys its switches off the `color-scheme` declarations in the style sheet, not inline `style.colorScheme`, which is one reason the `:root[data-theme]` rules stay in CSS (§9.2).
- **Why lightningcss must run last:** `purgeCss.ts` re-runs every PostCSS plugin
  on `dist/`. When that happens *after* lightningcss,
  `postcss-custom-properties` sees `--lightningcss-light: initial` and
  `--lightningcss-dark:` (empty) in `:root` and inlines them. Every color
  becomes `oklch(<light>) ;`, so the site is **always light** in every browser.
  Reproduced with `postcss-custom-properties` 15. The repo's current order
  (`lightningcss → purge-css`) has exactly this shape. Check your real `dist/`
  too: the live site did switch themes when inspected (§1.4), so its deployed
  build may differ.
- **PurgeCSS 7.0.2, run with the project's own options:**
  - **It removes the runtime-only theme selectors** (`:root[data-theme="light"]`, `:root[data-theme="dark"]`, the dark shell shadow, the toggle's `[data-when="light"]` rule), because the static HTML never contains `data-theme`.
  - **The existing safelist patterns protect nothing here.** PurgeCSS compares
    an attribute selector's *name* (`data-theme`, without brackets), so
    `/^\[data-.*\]$/` and `/^\[aria-.*\]$/` never match. `/^@media/`,
    `/^@container/` and `/^@supports/` don't match either, because at-rules
    aren't selectors. Rules inside `@media` are purged normally. Tested:
    `@media (…) { .unused {…} }` and `[data-x="1"]` were both removed.
  - **Fix:** the two safelist entries above. As belt and braces, `theme.ts` and the head script write `setAttribute('data-theme', …)` (§2.2, §9.8), which puts the literal token into the built HTML/JS. Both fixes verified.
  - `variables: true` drops unused custom properties. That's safe: tokens are either used, inlined, or read at runtime by CSS Modules, which PurgeCSS sees as `var()` uses.
- **Browser support (project policy):** `light-dark()` is used **without a hand-written fallback**. The guide rates it Baseline *Newly available* (since 2024-05-13: Chrome/Edge 123, Firefox 120, Safari 17.5). The browserslist targets (Baseline Widely available, above) all support it, so it ships native. `oklch()` is Baseline since 2023.

**Issues found in the current `src/styles` [V], fixed by this system:**
- `a-button.css` / `a-input.css` use variables that don't exist (`--space-3`, `--space-6`, `--text-color-quaternary`, `--text-color-senary`, `--background-tertiary` …), and `--lh-*` / `--ws-*` are never defined. An undefined `var()` makes the declaration fall back to the inherited/initial value, so those buttons have no fill. §9.5 replaces both atoms.
- The reset sets `outline: none` on `input`/`button`/`select`/`textarea`, and only `a` and `.a-input` define a `:focus-visible` style, so **buttons have no visible focus**. §9.4 removes `outline: none` and adds one global `:focus-visible` ring.
- The reset's `prefers-reduced-motion` block applies `0.01ms !important` to everything, which §8.3 replaces with per-effect motion.
- `--screen-tablet` / `--screen-desktop` can't be used in `@media` (custom properties aren't allowed there). Breakpoints are literal `em` values (§5.4).
- `html { font-size: var(--f-base) }` resolves to `1rem`, the user's own default, so it changes nothing. It is dropped, so there is no `font-size` on the root that a future edit could turn into px (§4, `text-scale`).

### 9.2 `settings/`

`settings/index.css`:

```css
@import "./colors.css";
@import "./shadows.css";
@import "./typography.css";
@import "./layout.css";
@import "./motion.css";
@import "./z-index.css";
```

`settings/colors.css` (one `:root` block: primitives first, then applications):

```css
:root {
  /* ---------- Primitives (private: only the applications below use them) ---------- */
  /* Neutrals: warm "bone" family and pure "charcoal" family (§3.1) */
  --white: oklch(100% 0 0);                  /* #ffffff */
  --bone-50: oklch(95.6% 0.014 84.6);        /* #f5f0e6 */
  --bone-100: oklch(92.7% 0.02 84.6);        /* #ede6d8 */
  --bone-200: oklch(88.4% 0.007 67.7);       /* #dcd8d4 */
  --bone-300: oklch(83% 0.016 73.7);         /* #cec6bc */
  --bone-400: oklch(75.8% 0.02 75.3);        /* #b8afa3 */
  --bone-500: oklch(55.7% 0.016 67.5);       /* #7a726a */
  --bone-550: oklch(55% 0.013 63.2);         /* #77706a */
  --bone-700: oklch(41.1% 0.017 67.3);       /* #514941 */
  --bone-800: oklch(32.9% 0.016 50.9);       /* #3c332e */
  --charcoal-700: oklch(30.1% 0 0);          /* #2e2e2e */
  --charcoal-800: oklch(26% 0 0);            /* #242424 */
  --charcoal-900: oklch(22.6% 0 0);          /* #1c1c1c */
  --charcoal-950: oklch(19.1% 0 0);          /* #141414 */

  /* HEV accent (§3.2) */
  --hev-50: oklch(96.6% 0.021 63.2);         /* #fff1e5 */
  --hev-200: oklch(82.3% 0.089 60.5);        /* #f0b88a */
  --hev-300: oklch(80.9% 0.127 56.3);        /* #ffaa6b */
  --hev-400: oklch(74.3% 0.174 51.8);        /* #ff862c */
  --hev-text-d: oklch(78.1% 0.143 52.1);     /* #ff9b5a */
  --hev-text-d-hover: oklch(83.2% 0.109 55.7);/* #ffb581 */
  --hev-text-l: oklch(42.1% 0.118 46.1);     /* #7f3300 */
  --hev-text-l-hover: oklch(36.1% 0.1 46.2); /* #662801 */
  --hev-900: oklch(36.6% 0.069 55.7);        /* #5a3417 */
  --hev-950: oklch(23.6% 0.035 57.4);        /* #2b1a0d */

  /* Status */
  --green-700: oklch(39.8% 0.1 147.5);       /* #175525 */
  --green-300: oklch(74.3% 0.128 148.1);     /* #6fc27d */
  --amber-700: oklch(41.2% 0.085 78.2);      /* #644400 */
  --amber-300: oklch(78.5% 0.149 86.2);      /* #e3b12c */
  --red-700: oklch(43% 0.175 29.5);          /* #990300 */
  --red-300: oklch(79% 0.121 26.3);          /* #ff9b91 */
  --blue-700: oklch(38.4% 0.089 255.2);      /* #1f4472 */
  --blue-300: oklch(75.5% 0.093 253.9);      /* #86b3ea */

  /* ---------- Applications (semantic, WCAG AAA, §3.3–§3.4) ----------
     light-dark(<light>, <dark>) follows the computed color-scheme: the OS by default
     (also the no-JS path), or the [data-theme] pin below. Shared values skip light-dark(). */

  /* Background */
  --background-color-primary: light-dark(var(--bone-100), var(--charcoal-950));
  --background-color-secondary: light-dark(var(--bone-50), var(--charcoal-900));
  --background-color-tertiary: light-dark(var(--white), var(--charcoal-800));
  --background-color-accent: var(--hev-400);
  --background-color-hover-accent: var(--hev-300);
  --background-color-accent-subtle: light-dark(var(--hev-50), var(--hev-950));
  --background-color-indicator: light-dark(var(--hev-text-l), var(--hev-text-d));
  --background-color-inverse: light-dark(var(--charcoal-900), var(--bone-100));

  /* Text */
  --text-color-primary: light-dark(var(--charcoal-900), var(--bone-100));
  --text-color-secondary: light-dark(var(--bone-800), var(--bone-300));
  --text-color-tertiary: light-dark(var(--bone-700), var(--bone-400));
  --text-color-accent: light-dark(var(--hev-text-l), var(--hev-text-d));
  --text-color-hover-accent: light-dark(var(--hev-text-l-hover), var(--hev-text-d-hover));
  --text-color-on-accent: light-dark(var(--charcoal-900), var(--charcoal-950));
  --text-color-inverse: light-dark(var(--bone-50), var(--charcoal-900));
  --text-color-success: light-dark(var(--green-700), var(--green-300));
  --text-color-warning: light-dark(var(--amber-700), var(--amber-300));
  --text-color-danger: light-dark(var(--red-700), var(--red-300));
  --text-color-info: light-dark(var(--blue-700), var(--blue-300));

  /* Border */
  --border-color-primary: light-dark(var(--bone-200), var(--charcoal-700));
  --border-color-strong: light-dark(var(--bone-500), var(--bone-550));
  --border-color-accent: var(--hev-400);
  --border-color-hover-accent: light-dark(var(--hev-200), var(--hev-900));

  /* Outline */
  --outline-color-focus: light-dark(var(--hev-text-l), var(--hev-text-d));

  color-scheme: light dark;
}

/* ---------- Theme pin (written by the head script / theme.ts) ----------
   Keep these as CSS rules even though the JS also sets style.colorScheme:
   lightningcss's light-dark() polyfill keys its --lightningcss-light/dark switches
   off color-scheme declarations in the stylesheet, not off inline styles (§9.1). */
:root[data-theme="light"] {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
}
```

`settings/shadows.css`. Kept separate because `light-dark()` only takes colors, and the shell shadow's geometry differs by theme. Only the raw values live here. The theme rule is in the Layout module (§9.6), since settings hold no selectors besides `:root`.

```css
:root {
  --box-shadow-shell-light: 0 1px 0 oklch(22.6% 0 0 / 0.04), 0 16px 32px -16px oklch(22.6% 0 0 / 0.22);
  --box-shadow-shell-dark: 0 0 0 1px oklch(100% 0 0 / 0.02), 0 24px 48px -24px oklch(0% 0 0 / 0.8);
}
```

`settings/typography.css`:

```css
:root {
  /* Use to convert px to rem (repo convention) */
  --rem-scale: calc(1rem / var(--f-base-number));
  --f-base-number: 16;

  /* Weight: only the Barlow weights that ship (§4.2) */
  --fw-normal: 400;
  --fw-medium: 500;
  --fw-bold: 700;
  --fw-extrabold: 800;

  /* Size: fluid between 360 and 448px viewports (postcss-utopia) */
  --f-title-xl: utopia.clamp(32, 40);        /* h1 name */
  --f-title-lg: utopia.clamp(22, 24);        /* section h2 */
  --f-title-md: calc(18 * var(--rem-scale)); /* role line */
  --f-body-lg: utopia.clamp(17, 18);         /* lead */
  --f-body-md: calc(16 * var(--rem-scale));  /* body */
  --f-body-sm: calc(14 * var(--rem-scale));  /* card descriptions */
  --f-label: calc(14 * var(--rem-scale));    /* nav, buttons, column headings */
  --f-micro: calc(12 * var(--rem-scale));    /* metadata only */

  /* Line height */
  --lh-title-xl: 1.1;
  --lh-title-lg: 1.2;
  --lh-title-md: 1.4;
  --lh-body-lg: 1.6;
  --lh-body-md: 1.6;
  --lh-body-sm: 1.5;
  --lh-label: 1.3;
  --lh-micro: 1.4;

  /* Letter spacing */
  --ls-title-xl: -0.005em;
  --ls-label: 0.06em;
  --ls-micro: 0.04em;

  /* Font family (faces come from Fontsource, §4.3; no @font-face here) */
  --font-fallback: system-ui, -apple-system, "Segoe UI", "Noto Sans", sans-serif;
  --font-primary: "Barlow", "Barlow Fallback", var(--font-fallback);
  --font-mono:
    "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, sfmono-regular,
    menlo, consolas, "Liberation Mono", monospace;
}
```

`settings/layout.css`:

```css
:root {
  /* Width */
  --max-w-shell: calc(480 * var(--rem-scale));
  --max-w-measure: 62ch;
  --height-nav: calc(56 * var(--rem-scale));

  /* Breakpoints are NOT tokens: var() doesn't work in @media.
     Use the literal em values: 40em · 48em · 64em · 90em (§5.4). */

  /* Spacing: N × 4px, the same steps as UnoCSS p-N / gap-N */
  --spacing-0: 0;
  --spacing-1: calc(4 * var(--rem-scale));
  --spacing-2: calc(8 * var(--rem-scale));
  --spacing-3: calc(12 * var(--rem-scale));
  --spacing-4: calc(16 * var(--rem-scale));
  --spacing-5: calc(20 * var(--rem-scale));
  --spacing-6: calc(24 * var(--rem-scale));
  --spacing-7: calc(28 * var(--rem-scale));
  --spacing-8: calc(32 * var(--rem-scale));
  --spacing-9: calc(36 * var(--rem-scale));
  --spacing-11: calc(44 * var(--rem-scale));
  --spacing-12: calc(48 * var(--rem-scale));
  --spacing-14: calc(56 * var(--rem-scale));
  --spacing-16: calc(64 * var(--rem-scale));

  /* Spacing applications */
  --spacing-gutter: var(--spacing-4);
  --spacing-stack: var(--spacing-4);
  --spacing-section: var(--spacing-8);

  /* Border width */
  --border-025: calc(1 * var(--rem-scale)); /* hairline */
  --border-05: calc(2 * var(--rem-scale));  /* HEV rule, indicators, focus ring */

  /* Border radius ("machined", §6.1) */
  --border-radius-0: 0;
  --border-radius-05: calc(2 * var(--rem-scale)); /* buttons, chips, toggle */
  --border-radius-1: calc(4 * var(--rem-scale));  /* cards, media */
  --border-radius-2: calc(8 * var(--rem-scale));  /* floating shell */
  --border-radius-circle: 50%;                    /* status dots */
}
```

`settings/motion.css`:

```css
:root {
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}
```

`settings/z-index.css` (repo pattern: private scale + applications):

```css
:root {
  /* Z-Index Scale (private vars) */
  --z-index-0: 0;
  --z-index-10: 10;
  --z-index-50: 50;
  --z-index-100: 100;

  /* Z-Index Applications */
  --z-index-10-sticky-nav: var(--z-index-10);
  --z-index-50-overlay: var(--z-index-50);     /* reserved */
  --z-index-100-skip-link: var(--z-index-100);
}
```

### 9.3 `tools/typography.css` (type-role mixins)

```css
/* stylelint-disable at-rule-no-unknown */
@define-mixin heading-xl {
  /* h1 name */
  font-family: var(--font-primary);
  font-size: var(--f-title-xl);
  font-weight: var(--fw-extrabold);
  line-height: var(--lh-title-xl);
  letter-spacing: var(--ls-title-xl);
  text-wrap: balance;
}

@define-mixin heading-lg {
  /* section h2 */
  font-family: var(--font-primary);
  font-size: var(--f-title-lg);
  font-weight: var(--fw-extrabold);
  line-height: var(--lh-title-lg);
  text-wrap: balance;
}

@define-mixin heading-md {
  /* role line (a <p>, not a heading) */
  font-family: var(--font-primary);
  font-size: var(--f-title-md);
  font-weight: var(--fw-medium);
  line-height: var(--lh-title-md);
}

@define-mixin body-lg {
  font-family: var(--font-primary);
  font-size: var(--f-body-lg);
  font-weight: var(--fw-normal);
  line-height: var(--lh-body-lg);
  text-wrap: pretty;
}

/* $weight: card titles pass var(--fw-bold). A parameter, not an override: stylelint's
   order/order moves @mixin after declarations, so a sibling font-weight would lose. */
@define-mixin body-md $weight: var(--fw-normal) {
  font-family: var(--font-primary);
  font-size: var(--f-body-md);
  font-weight: $weight;
  line-height: var(--lh-body-md);
}

@define-mixin body-sm {
  font-family: var(--font-primary);
  font-size: var(--f-body-sm);
  font-weight: var(--fw-normal);
  line-height: var(--lh-body-sm);
}

@define-mixin label {
  font-family: var(--font-primary);
  font-size: var(--f-label);
  font-weight: var(--fw-bold);
  line-height: var(--lh-label);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
}

@define-mixin micro {
  /* metadata only: never essential content */
  font-family: var(--font-mono);
  font-size: var(--f-micro);
  font-weight: var(--fw-medium);
  line-height: var(--lh-micro);
  letter-spacing: var(--ls-micro);
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}

@define-mixin visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

> **[P] The repo's `font-fallback` / `font-primary` mixins and the `body.fonts-loaded` swap are not carried over.** That pattern needs JS to add the class, and the class flip re-lays out the page a second time. The metric-matched `Barlow Fallback` + `font-size-adjust: from-font` (§4.3) gives a stable swap with no class and no JS.

### 9.4 `generic/`, `elements/`, `utilities/`

`generic/light-reset.css`, the repo's reset with the accessibility fixes marked:

```css
@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    padding: 0;
    margin: 0;
    font: inherit;
  }

  body {
    min-block-size: 100dvh;
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
    text-wrap: balance;
  }

  p, li, dd {
    overflow-wrap: break-word;
    text-wrap: pretty;
  }

  img, video, svg, canvas, picture {
    display: block;
    block-size: auto;
    max-inline-size: 100%;
  }

  /* Safari drops list semantics with list-style: none, so lists that matter
     (nav, social row, chips) carry role="list" in the markup (§7). */
  li {
    list-style: none;
  }

  input, button, textarea, select {
    color: currentcolor;
    font: inherit;
    letter-spacing: inherit;
    word-spacing: inherit;
    /* FIX: no `outline: none`. The focus ring comes from elements/global.css. */
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
  }

  textarea {
    field-sizing: content;
  }

  /* FIX: no global prefers-reduced-motion override (§8.3). Each effect opts in
     to motion next to its own rule; smooth scrolling lives in elements/html.css. */
}
```

`elements/index.css`:

```css
@import "./html.css";
@import "./body.css";
@import "./headings.css";
@import "./link.css";
@import "./global.css";
```

`elements/html.css`:

```css
html {
  block-size: 100%;
  text-size-adjust: 100%;
  accent-color: var(--text-color-accent);                                   /* native controls; test indicator contrast in Safari */
  scrollbar-color: var(--border-color-strong) var(--background-color-primary); /* thumb vs track: 3.81 light / 3.78 dark (≥ 3:1) */

  /* No font-size: inherit the user's default (text-scale, §2.2). */

  @media (prefers-reduced-motion: no-preference) {
    scroll-behavior: smooth;
  }
}
```

`elements/body.css`:

```css
body {
  background-color: var(--background-color-secondary); /* < 40em: the shell is full-bleed */
  color: var(--text-color-primary);
  font-family: var(--font-primary);
  font-size-adjust: from-font;                         /* stable x-height during the font swap (§4.3) */
  font-weight: var(--fw-normal);
  line-height: var(--lh-body-md);
  -webkit-font-smoothing: antialiased;
  font-synthesis: none;

  @media (width >= 40em) {
    background-color: var(--background-color-primary);
  }
}
```

`elements/headings.css`:

```css
h1 {
  @mixin heading-xl;
}

h2 {
  @mixin heading-lg;
}

h3 {
  @mixin label;
}
```

`elements/link.css`:

```css
a {
  color: inherit;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* A bare link in prose (no class) is an inline link. Components always set a
   class, so they opt out. Underlined, so color is not the only signal. */
a:not([class]) {
  color: var(--text-color-accent);
  text-decoration-line: underline;
  text-decoration-thickness: var(--border-025);
  text-underline-offset: 0.2em;
  transition: color var(--duration-fast) var(--ease-standard);

  &:hover {
    color: var(--text-color-hover-accent);
    text-decoration-thickness: var(--border-05);
  }
}
```

`elements/global.css`:

```css
/* One focus ring for everything (BM pattern: 2px, offset 2px). AAA: ≥ 7:1, §3.5. */
:focus-visible {
  outline: var(--border-05) solid var(--outline-color-focus);
  outline-offset: calc(2 * var(--rem-scale));
}

::selection {
  background-color: var(--background-color-accent-subtle);
  color: var(--text-color-primary);
}

[id] {
  scroll-margin-top: calc(var(--height-nav) + var(--spacing-4));
}
```

`utilities/a11y.css` and `utilities/theme.css`:

```css
.sr-only {
  @mixin visually-hidden;
}

.skip-link:not(:focus-visible) {
  @mixin visually-hidden;
}

.skip-link:focus-visible {
  position: fixed;
  inset-block-start: var(--spacing-2);
  inset-inline-start: var(--spacing-2);
  z-index: var(--z-index-100-skip-link);
}

/* Suppress transitions during a theme flip (set/removed by theme.ts, §9.8) */
[data-theme-switching] *,
[data-theme-switching] *::before,
[data-theme-switching] *::after {
  /* stylelint-disable-next-line declaration-no-important -- must beat every component transition */
  transition: none !important;
}
```

### 9.5 `atoms/`

`atoms/index.css`:

```css
@import "./a-button.css";
@import "./a-link-action.css";
@import "./a-chip.css";
```

`atoms/a-button.css` (replaces the repo's version, which used undefined variables):

```css
.a-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: calc(10 * var(--rem-scale));
  min-block-size: var(--spacing-11);
  padding-inline: var(--spacing-5);
  border: var(--border-025) solid transparent;
  border-radius: var(--border-radius-05);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition:
    background-color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard);

  &:active {
    translate: 0 1px;
  }

  &:is(:disabled, [aria-disabled="true"]) {
    opacity: 0.45;
    cursor: not-allowed;
    translate: none;
  }

  @mixin label;
}

.a-button--primary {
  background-color: var(--background-color-accent);
  color: var(--text-color-on-accent);

  &:not(:disabled, [aria-disabled="true"]):hover {
    background-color: var(--background-color-hover-accent);
  }
}

.a-button--secondary {
  border-color: var(--border-color-strong);
  background-color: transparent;
  color: var(--text-color-primary);

  &:not(:disabled, [aria-disabled="true"]):hover {
    border-color: var(--background-color-inverse);
    background-color: var(--background-color-inverse);
    color: var(--text-color-inverse);
  }
}

/* Opt-in HL2 diagonal wipe: the single primary CTA only, motion users only.
   Under `reduce` there is no ::before at all; the plain hover fill applies. */
.a-button--wipe {
  position: relative;
  overflow: hidden;
  isolation: isolate;

  @media (prefers-reduced-motion: no-preference) {
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      inline-size: 120%;
      z-index: -1;
      background-color: var(--background-color-hover-accent);
      transform: skewX(-33deg) translateX(-110%);
      transition: transform var(--duration-slow) var(--ease-out);
    }

    &:is(:hover, :focus-visible)::before {
      transform: skewX(-33deg) translateX(-10%);
    }
  }
}
```

`atoms/a-link-action.css`:

```css
.a-link-action {
  display: inline-flex;
  align-items: center;
  gap: calc(6 * var(--rem-scale));
  min-block-size: var(--spacing-11);
  color: var(--text-color-accent);
  transition: color var(--duration-fast) var(--ease-standard);

  &:hover {
    color: var(--text-color-hover-accent);
  }

  @mixin label;
}

.a-link-action__icon {
  inline-size: var(--spacing-4);
  block-size: var(--spacing-4);

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    transition: translate var(--duration-base) var(--ease-out);

    .a-link-action:hover & {
      translate: 2px 0;
    }
  }
}
```

`atoms/a-chip.css`:

```css
.a-chip {
  display: inline-flex;
  align-items: center;
  gap: calc(6 * var(--rem-scale));
  min-block-size: var(--spacing-7);
  max-inline-size: 100%;
  padding-inline: var(--spacing-2);
  border: var(--border-025) solid var(--border-color-primary);
  border-radius: var(--border-radius-05);
  background-color: var(--background-color-tertiary);
  color: var(--text-color-secondary);
  white-space: nowrap;

  @mixin micro;
}

.a-chip--success { color: var(--text-color-success); }
.a-chip--warning { color: var(--text-color-warning); }
.a-chip--danger  { color: var(--text-color-danger); }
.a-chip--info    { color: var(--text-color-info); }

.a-chip__dot {
  flex-shrink: 0;
  inline-size: calc(6 * var(--rem-scale));
  block-size: calc(6 * var(--rem-scale));
  border-radius: var(--border-radius-circle);
  background-color: currentcolor;

  /* The text label carries the meaning; the dot just stays visible (§6.6). */
  @media (forced-colors: active) {
    forced-color-adjust: none;
    background-color: CanvasText;
  }
}

.a-chip__label {
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 9.6 Components (CSS Modules)

Each component keeps its own `styles.module.css` (repo pattern). **Class names
follow BEM with the component as the block**, as the repo does
(`styles.navbar__link`). The short names below (`.link`, `.card`, `.title`)
stand for `<block>__<element>`: `.link` in the Navbar module is `.navbar__link`,
`.title` in TileCard is `.tile-card__title`, and so on. In Astro, combine layout
utilities and the module class with `class:list={['flex …', styles.name]}`.
Motion follows §8.3: static by default, with the transition nested under
`no-preference`. Forced Colors Mode fixes live next to the rule they fix (§6.6).
The modules for the patterns that need more than tokens:

`layouts/Layout/styles.module.css`: shell + the separate shadows block:

```css
.shell {
  inline-size: 100%;
  max-inline-size: var(--max-w-shell);
  margin-inline: auto;
  overflow: clip;
  background-color: var(--background-color-secondary);

  @media (width >= 40em) {
    margin-block: var(--spacing-8);
    border: var(--border-025) solid var(--border-color-primary);
    border-radius: var(--border-radius-2);
    box-shadow: var(--box-shadow-shell-light);

    /* Shadows block: light-dark() takes colors only, so the theme is matched here.
       It sets box-shadow directly (not a token override), so the build's
       postcss-custom-properties step can't inline it away (§9.1). */
    :root[data-theme="dark"] & {
      box-shadow: var(--box-shadow-shell-dark);
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-theme]) & {
        box-shadow: var(--box-shadow-shell-dark); /* no-JS */
      }
    }
  }

  @media (width >= 48em) {
    margin-block: var(--spacing-12);
  }
}
```

`components/ThemeToggle/styles.module.css`:

```css
.toggle {
  position: relative;
  border: var(--border-025) solid var(--border-color-strong);
  border-radius: var(--border-radius-05);
  background-color: var(--background-color-tertiary);
  color: var(--text-color-tertiary);
  touch-action: manipulation;
  transition: color var(--duration-fast) var(--ease-standard);

  &::after {
    content: "";
    position: absolute;
    inset: -4px; /* 36 + 8 = 44px hit area */
  }

  &:hover {
    color: var(--text-color-primary);
  }

  &:active {
    translate: 0 1px;
  }

  /* An author `display` (the Uno `grid` class) would beat the UA [hidden] rule */
  &[hidden] {
    display: none;
  }

  /* Show only the rendered state. display: none also removes the other label from
     the a11y tree, so the name stays right when the OS theme changes (no JS). */
  :root:not([data-theme="dark"]) & [data-when="dark"],
  :root[data-theme="dark"] & [data-when="light"] {
    display: none;
  }

  /* Forced colors: nothing to redraw. It is a native <button> (ButtonFace/ButtonText
     + border), and its state is the icon's shape, not a color. */
}
```

`components/Navbar/styles.module.css` (section nav link + BM underline):

```css
.link {
  color: var(--text-color-secondary);
  transition: color var(--duration-fast) var(--ease-standard);

  &::after {
    content: "";
    position: absolute;
    inset-inline: var(--spacing-3);
    inset-block-end: var(--spacing-2);
    block-size: var(--border-05);
    background-color: var(--background-color-indicator);
    scale: 0 1;
    transform-origin: left;

    @media (prefers-reduced-motion: no-preference) {
      transition: scale var(--duration-slow) var(--ease-out);
    }
  }

  &:is(:hover, :focus-visible, [aria-current="true"]) {
    color: var(--text-color-primary);

    &::after {
      scale: 1;
    }
  }

  @mixin label;

  @media (forced-colors: active) {
    &::after {
      background: none;
      border-block-end: var(--border-05) solid CanvasText;
    }

    &[aria-current="true"]::after {
      border-color: Highlight;
    }
  }
}

.bar {
  z-index: var(--z-index-10-sticky-nav);
  border-block-end: var(--border-025) solid var(--border-color-primary);
  background-color: var(--background-color-secondary);
}
```

`components/TileCard/styles.module.css` (freelance, side projects and open source):

```css
.tile {
  border-radius: var(--border-radius-1);
  color: var(--text-color-primary);
}

.media {
  border: var(--border-025) solid var(--border-color-primary);
  border-radius: var(--border-radius-1);
  background-color: var(--background-color-tertiary);

  & img {
    @media (hover: hover) and (prefers-reduced-motion: no-preference) {
      transition: scale var(--duration-slow) var(--ease-out);

      .tile:hover & {
        scale: 1.03;
      }
    }
  }
}
```

The other modules (system bar, hero, social row, section header, footer, bio) only apply tokens and mixins, exactly as listed in §7.

### 9.7 `uno.config.ts` (layout only)

```ts
import { defineConfig, presetWind3, transformerVariantGroup } from 'unocss'

/**
 * UnoCSS is for LAYOUT ONLY: display, flex/grid, gap, padding/margin, sizing,
 * position/inset, overflow, aspect-ratio, order, line-clamp, and their responsive
 * variants. Color, type, borders, radius, shadows and motion live in src/styles
 * (tokens, mixins, atoms) and in each component's CSS Module.
 *
 * Spacing needs no theme: presetWind3's p-4 / gap-4 = 1rem = --spacing-4,
 * i.e. the same N × 4px scale as settings/layout.css.
 */
const VISUAL_UTILITIES = [
  // color, type, borders, effects, motion
  /(^|:)(bg|text|border|divide|ring|outline|shadow|rounded|font|leading|tracking|decoration|underline|transition|duration|ease|delay|animate|opacity|fill|stroke|accent|caret|placeholder)(-|$)/,
  /(^|:)(uppercase|lowercase|capitalize|italic|truncate|antialiased)$/,
]

export default defineConfig({
  // 'on-demand': the preflight declares only the --un-* variables a used
  // utility needs, not every transform/ring/shadow/filter one.
  presets: [presetWind3({ preflight: 'on-demand' })],
  transformers: [transformerVariantGroup()],
  blocklist: VISUAL_UTILITIES,
  // Keep the repo's own preflight (--un-unit) and logical-property rules
  // (pt/pb/mt/mb → padding/margin-block-*, w-* → inline-size). User rules are
  // matched before preset rules, so they replace the preset's physical versions.
  preflights: [/* existing --un-unit preflight */],
  rules: [/* existing pt/pb/mt/mb/w rules */],
  theme: {
    // em, not px, so layouts follow the user's text size (§5.4). Base (< 40em) is mobile.
    breakpoints: {
      sm: '40em',
      md: '48em',
      lg: '64em',
      xl: '90em',
    },
  },
})
```

> **[P] Today the repo's `uno.config.ts` has no preset**, only its own `pt/pb/mt/mb/w` rules **[V]**, so `flex`, `grid`, `gap-*` or `items-center` from §7 would generate nothing. Adding `presetWind3` (with the blocklist) is what makes the §7 layout utilities exist. Check in the inspector that your logical rules still win over the preset's `mt-*`/`w-*`.
>
> **[P] Check the blocklist in the UnoCSS inspector (`/__unocss` in dev).** A blocked utility produces no CSS, so a stray `text-red-500` shows up as "nothing happens" instead of a silent off-token color. Adjust the patterns if your UnoCSS version matches variants differently.

`astro.config.mjs` excerpt:

```js
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'
import icon from 'astro-icon'

export default defineConfig({
  // injectReset: false — generic/light-reset.css is the only reset (no second one from @unocss/reset)
  integrations: [UnoCSS({ injectReset: false }), icon()],
})
```

### 9.8 `src/scripts/theme.ts`

```ts
/**
 * Data model: tri-state (nothing stored = 'system', or a literal 'light' | 'dark' override).
 * UI: two states (one button). The explicit value matching the OS is unreachable:
 * flipping back to the OS theme clears the override instead of storing it.
 */
export const THEME_STORAGE_KEY = 'galeed:theme' as const
export const RESOLVED_THEMES = ['light', 'dark'] as const

export type ResolvedTheme = (typeof RESOLVED_THEMES)[number]
export type ThemePreference = ResolvedTheme | 'system'
export interface ThemeChangeDetail {
  preference: ThemePreference
  resolved: ResolvedTheme
}

declare global {
  interface DocumentEventMap {
    themechange: CustomEvent<ThemeChangeDetail>
  }
}

const darkQuery = (): MediaQueryList => window.matchMedia('(prefers-color-scheme: dark)')
const systemTheme = (): ResolvedTheme => (darkQuery().matches ? 'dark' : 'light')

export const isResolvedTheme = (value: unknown): value is ResolvedTheme =>
  value === 'light' || value === 'dark'

export function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isResolvedTheme(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export const resolveTheme = (preference: ThemePreference): ResolvedTheme =>
  preference === 'system' ? systemTheme() : preference

/** The theme on screen right now: the source of truth for the toggle. */
const renderedTheme = (): ResolvedTheme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

/** Paint a preference. Never touches storage. */
function render(preference: ThemePreference): void {
  const root = document.documentElement
  const resolved = resolveTheme(preference)

  // Suppress color transitions for two frames so the swap is instant everywhere.
  root.setAttribute('data-theme-switching', '')
  root.setAttribute('data-theme', resolved) // literal attribute names: visible to PurgeCSS (§9.1)
  root.setAttribute('data-theme-pref', preference)
  root.style.colorScheme = resolved
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute('data-theme-switching')),
  )

  document.dispatchEvent(
    new CustomEvent<ThemeChangeDetail>('themechange', { detail: { preference, resolved } }),
  )
}

/**
 * Two-state toggle:
 * 1. target = the opposite of what is rendered (not the opposite of the OS default);
 * 2. target ≠ OS → store it literally;
 * 3. target = OS → the user is undoing their adjustment: remove the key, never store it.
 * Divergence is checked here only. A stored value that the OS later matches is kept.
 */
export function toggleTheme(): void {
  const target: ResolvedTheme = renderedTheme() === 'dark' ? 'light' : 'dark'
  const preference: ThemePreference = target === systemTheme() ? 'system' : target
  try {
    if (preference === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    /* storage unavailable: the theme still applies for this page view */
  }
  render(preference)
}

let globalListenersBound = false

/** Call once per page load (and after Astro view-transition swaps). */
export function initTheme(): void {
  // Re-assert attributes (needed after <ClientRouter /> swaps the document).
  render(readPreference())

  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.hidden = false
    if (button.dataset.bound) return
    button.dataset.bound = 'true'
    button.addEventListener('click', toggleTheme)
  })
  // No toggle sync needed: its icon and label follow :root[data-theme] in CSS.

  if (globalListenersBound) return
  globalListenersBound = true

  darkQuery().addEventListener('change', () => {
    // Follow the OS only while no override is active. Never clear a stored value
    // because the OS now matches it (time-of-day OS switching would erase every pin).
    if (document.documentElement.dataset.themePref === 'system') render('system')
  })

  window.addEventListener('storage', (event) => {
    // key === null means another tab called localStorage.clear()
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return
    render(readPreference())
  })

  document.addEventListener('astro:after-swap', initTheme)
}
```

`components/ThemeToggle/index.astro`:

```astro
---
import { Icon } from 'astro-icon/components'
import styles from './styles.module.css'
---
<button
  type="button"
  class:list={['grid place-items-center size-9', styles.toggle]}
  data-theme-toggle
  hidden
>
  <span data-when="light">
    <Icon name="lucide:sun" size={16} aria-hidden="true" /><span class="sr-only">Cambiar a tema oscuro</span>
  </span>
  <span data-when="dark">
    <Icon name="lucide:moon" size={16} aria-hidden="true" /><span class="sr-only">Cambiar a tema claro</span>
  </span>
</button>
<script>
  import { initTheme } from '../../scripts/theme'
  initTheme()
</script>
```

### 9.9 `src/types/design-tokens.ts`

```ts
/** Every semantic color application: declared once in settings/colors.css :root. */
export const COLOR_TOKENS = [
  'background-color-primary', 'background-color-secondary', 'background-color-tertiary', 'background-color-accent', 'background-color-hover-accent', 'background-color-accent-subtle', 'background-color-indicator', 'background-color-inverse',
  'text-color-primary', 'text-color-secondary', 'text-color-tertiary', 'text-color-accent', 'text-color-hover-accent', 'text-color-on-accent', 'text-color-inverse', 'text-color-success', 'text-color-warning', 'text-color-danger', 'text-color-info',
  'border-color-primary', 'border-color-strong', 'border-color-accent', 'border-color-hover-accent',
  'outline-color-focus',
] as const
export type ColorToken = (typeof COLOR_TOKENS)[number]
export type ColorVar = `--${ColorToken}`

/** Same value in both themes, so written without light-dark(). */
export const SHARED_COLOR_TOKENS = [
  'background-color-accent', 'background-color-hover-accent', 'border-color-accent',
] as const satisfies readonly ColorToken[]

export type SpacingToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 12 | 14 | 16
export type RadiusToken = '0' | '05' | '1' | '2' | 'circle'
export type BorderToken = '025' | '05'
export type DurationToken = 'instant' | 'fast' | 'base' | 'slow'
export type EaseToken = 'standard' | 'out' | 'in'
export type TypeMixin =
  | 'heading-xl' | 'heading-lg' | 'heading-md' | 'body-lg' | 'body-md' | 'body-sm' | 'label' | 'micro'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info'

export const cssVar = <T extends string>(name: T) => `var(--${name})` as const

/** Content models for the hub's sections */
export interface SocialLink {
  label: string
  href: string
  icon: `simple-icons:${string}` | `lucide:${string}`
}
export interface LinkItem {
  title: string
  href: string
  meta?: string            // e.g. "2024—2025 · Frontend"
  status?: { label: string; tone: StatusTone }
  external?: boolean
}
export interface TileItem extends LinkItem {
  image?: ImageMetadata    // from astro:assets
  alt: string
  featured?: boolean
  description?: string
}
export interface RepoItem {
  repo: `${string}/${string}`
  href: string
  description: string
  language?: string
  license?: string
  status?: { label: string; tone: StatusTone }
}
```

A tiny build-time guard, worth adding as a Vitest/Node test:

```ts
// tests/tokens.test.ts: one declaration per semantic color, light-dark() unless shared, no per-theme overrides
import { readFileSync } from 'node:fs'
import { COLOR_TOKENS, SHARED_COLOR_TOKENS } from '../src/types/design-tokens'

// Strip comments first: they mention [data-theme] and would trip the override check.
const read = (file: string) => readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const css = read('src/styles/settings/colors.css')
const root = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
const shared = new Set<string>(SHARED_COLOR_TOKENS)

for (const t of COLOR_TOKENS) {
  const value = root.match(new RegExp(`--${t}:\\s*([^;]+);`))?.[1]?.trim()
  if (!value) throw new Error(`--${t} missing in :root`)
  if (!shared.has(t) && !value.startsWith('light-dark(')) throw new Error(`--${t} must use light-dark()`)
}
// postcss-custom-properties (preserve: false) only reads :root, so a per-theme override would be inlined away.
if (/\[data-theme[^\]]*\][^{]*\{[^}]*--(background|text|border|outline)-color-/.test(css))
  throw new Error('color tokens may only be declared in :root')
const shadows = read('src/styles/settings/shadows.css')
for (const v of ['--box-shadow-shell-light', '--box-shadow-shell-dark'])
  if (!shadows.includes(`${v}:`)) throw new Error(`${v} missing`)
```

---

## 10. Anti-patterns & pre-delivery checklist

### 10.1 Anti-patterns

**Observed on the references. Do not copy:**

| Anti-pattern | Where seen |
| --- | --- |
| White text on orange (2.41 / 3.13:1) | HL2 nav, BM CTA |
| Ultra-light body weights (200/300) | HL2, BM |
| Content invisible until scroll-triggered animation fires | LK |
| Low-contrast input fills (2.46:1) | LK |
| Icon-only social links without visible labels | LK |
| Nav clipped by horizontal overflow with no cue | GL, LK |
| Anchor links to non-existent IDs | GL |
| Emoji as icons (flag degrades to "AR") | GL |
| `dark:` utilities that never activate, leaving dividers and shadows invisible in dark | GL |
| Heading tags used for non-heading text (role line as `<h2>`) | GL |

**Half-Life aesthetic guardrails:** see §6.5. In short: no logos, no game art, no scanlines/glow/HUD chrome, one accent hue, orange is never body text in light mode.

**General (ui-ux-pro-max):** raw hex in components; `dark:` color overrides instead of tokens; more than one primary CTA per view; animating layout properties; hover-only affordances; removing focus outlines; placeholder-as-label; `100vh` on mobile (use `dvh`); fixed-pixel containers that cause horizontal scroll; disabling zoom.

### 10.2 Pre-delivery checklist

**Accessibility (critical)**
- [ ] **AAA contrast:** every text pair in §3.4 holds in both themes. All text (normal and large) ≥ 7:1, UI boundaries and focus ring ≥ 3:1. Re-check any new pair, and never lower text contrast with `opacity` or alpha.
- [ ] Spot-check the rendered page with a contrast tool (e.g. browser DevTools' contrast picker) in both themes, since `oklch()` values are converted to sRGB by the browser.
- [ ] Visible `:focus-visible` ring on every interactive element in both themes, never obscured by the sticky nav (`scroll-margin-top` set).
- [ ] Full keyboard path: skip link → theme toggle (Enter/Space flips it) → social → nav → cards → CTA → footer. Tab order matches visual order.
- [ ] Heading outline: one `h1` (name) → `h2` per section → `h3` for Bio columns only. No skipped levels.
- [ ] **Focus:** no `outline: none` anywhere (the repo reset had one, §9.4). Tab through every button and link in both themes.
- [ ] Icons: decorative icons next to text have `aria-hidden="true"`. Icon-only controls have names (the theme toggle's name is the `sr-only` action, "Cambiar a tema oscuro/claro", and only the visible state's label is in the a11y tree).
- [ ] **No emoji used as UI icons.** One icon family per role (Lucide for UI, Simple Icons for brands), 1.5–2px stroke, consistent sizes (16/18/20).
- [ ] Color is never the only signal (status chips have text, the active nav has an underline, the theme toggle state is a sun or moon shape).
- [ ] External links announce new-tab behavior. `rel="me noopener"` on profile links.
- [ ] Portrait and tile images have meaningful `alt`. Decorative fades are pseudo-elements.
- [ ] **Forced colors:** emulate `forced-colors: active` (DevTools → Rendering). The current nav section, card hover bar, theme toggle (border + icon), status dots and focus ring are all still visible.
- [ ] **OS text size:** with Android/ChromeOS text size raised (the `text-scale` meta), and with browser text size at 200%, nothing clips and breakpoints switch earlier instead of overflowing.

**Interaction**
- [ ] Touch targets ≥ 44×44px (the theme toggle via `::after` extension), ≥ 8px between targets.
- [ ] `cursor: pointer` on all clickable elements. `touch-action: manipulation`.
- [ ] Hover transforms are wrapped in `@media (hover: hover)`.
- [ ] Theme toggle, two states (run the §2.3 scenario with DevTools' `prefers-color-scheme` emulation): with the OS light, a click stores `dark`. Switching the OS to dark and then back to light leaves the site dark and the key **kept**. A second click (target = OS) **removes** the key, and the site follows the OS again. With nothing stored, an OS change repaints live.
- [ ] Rapid clicking ends on the expected theme (an even number of clicks returns to the start). The button's accessible name always describes the next action, including right after an OS theme change.

**Theming**
- [ ] No FOUC: hard-reload in dark OS with an empty cache and throttled network. First paint is dark.
- [ ] Every semantic color (`--background-color-*`, `--text-color-*`, `--border-color-*`, `--outline-color-*`) is **one** declaration in `settings/colors.css` `:root`, using `light-dark()` over two primitives (or one shared primitive), and no `[data-theme]` rule redefines a token. Components never reference a primitive directly. Run the test in §9.9.
- [ ] **Build order is `astro build && purge-css && lightningcss`** (lightningcss last, §9.1). In `dist/`, `--lightningcss-light` must never appear inlined as a bare value.
- [ ] **UnoCSS output is layout only:** the inspector (`/__unocss`) shows no color, type, border, radius, shadow or transition utilities (blocklist, §9.7).
- [ ] Every `@mixin` used in a CSS Module resolves (postcss-mixins `mixinsFiles`, §9.1): grep `dist/` for a leftover `@mixin`.
- [ ] **Build output** (`dist/`): `:root[data-theme="light"]`,
      `:root[data-theme="dark"]`, the Layout module's dark shell rule
      (`:root[data-theme="dark"] ._shell_…`), `[data-theme-switching]`, and the
      nav module's `[aria-current="true"]` rule are still present (PurgeCSS,
      §9.1). Then: use sites contain `light-dark(` (native for the Baseline
      targets; lightningcss's `--lightningcss-light/dark` polyfill only for
      older ones). `:root[data-theme="dark"]` sets `color-scheme: dark`. The toggle and the
      no-JS OS path both turn **everything** dark, including `color-mix()` tints
      (lightningcss precomputes them per theme) and the shell shadow.
- [ ] Borders, dividers, and the shell edge are visible in **both** themes (the regression from §1.4 issue 4).
- [ ] With JS disabled, the system theme still applies and the toggle stays hidden.

**Layout & text resilience**
- [ ] Test at 320, 375, 390, 640, 768, 1024, 1440. No horizontal page scroll anywhere (`documentElement.scrollWidth === innerWidth`).
- [ ] Nav is one scrolling line: edges fade, the last link is reachable by touch, mouse and keyboard, and the current link scrolls into view. All 5 anchors resolve to existing IDs.
- [ ] Long name, long role, long repo name (`owner/a-really-long-repository-name`), and long Spanish titles all wrap without overflow. Chips stay single-line and the collection wraps.
- [ ] Browser zoom 200% and text-only zoom: no clipped or overlapping text.
- [ ] Landscape on phones: the hero doesn't consume the whole viewport (5:4 ratio under 640px).

**Motion**
- [ ] With `prefers-reduced-motion: reduce`: no wipe, no zoom, no arrow nudge, no smooth scroll. The nav underline and card bar still appear (instantly), and color hover feedback still works.
- [ ] No global `transition-duration` / `animation-duration` override anywhere in the CSS (§8.3).
- [ ] All content is visible at first paint with no entrance animations.

**Performance**
- [ ] Portrait via `<Picture>` (AVIF/WebP), `fetchpriority="high"`, explicit dimensions. Tiles are lazy-loaded with dimensions. CLS < 0.1.
- [ ] Only Barlow 400 + 700 + 800 latin preloaded, each pointing at the same hashed file the `@font-face` uses (no double download). Fallback face metric-matched, plus `font-size-adjust: from-font` verified by blocking the font files. No Google Fonts CSS request.
- [ ] No GSAP or animation libraries. JS limited to `theme.ts` and the nav scrollspy.

### 10.3 Maintenance rules

1. New colors enter as **primitives + one application** in `settings/colors.css`: the primitives in `oklch()`, the application as `light-dark(var(--<light>), var(--<dark>))`, with a measured contrast ratio that meets **AAA** (≥ 7:1 for text). Never as raw values in components.
2. A second accent hue requires removing the first.
3. Any new Half-Life touch must pass the question: "Would this still look intentional on a plain editorial blog?"

---

## 11. Appendix: verification log

### 11.1 Inspection method

| URL | Viewports | Methods | Result |
| --- | --- | --- | --- |
| half-life.com/en/halflife2 | 1440×900 | `getComputedStyle` sampling (body, h1–h4, p, a, button, footer, sections), `document.fonts`, CSSOM `@font-face` / `:hover` / `@media` rule scan, screenshot | loaded ✓ |
| blackmesagame.com | 1440×900 | same + recursive CSSOM walk for custom properties (Tailwind v4 `@layer` tokens), `.type-*` rule extraction, screenshot | loaded ✓ |
| galeed.link | 1440×900, 390×844, emulated dark | computed styles, geometry, `[id]` scan, href scan, CSSOM custom properties, lab→hex conversion via canvas, accessibility snapshot, screenshots | loaded ✓ |
| linkd-layouts.framer.website/designer | 1440×900, 390×844 | computed styles + geometry after a scroll pass (to trigger appear effects), accessibility snapshot, screenshots | loaded ✓ (console reported third-party errors, which did not block inspection) |

`curl` fallback was not needed. All values came from the rendered pages.

### 11.2 Token cross-reference audit

Every CSS variable referenced by the atoms, CSS Modules, `elements/`, `utilities/` and the component specs:

| Variable group | Declared in | How it switches theme |
| --- | --- | --- |
| Primitives: `--white`, `--bone-*`, `--charcoal-*`, `--hev-*`, `--green-*`, `--amber-*`, `--red-*`, `--blue-*` | `settings/colors.css` `:root` | they don't: each primitive is one fixed color |
| `--background-color-*` (8), `--text-color-*` (11), `--border-color-*` (4), `--outline-color-focus` | `settings/colors.css` `:root`, once each | `light-dark()` over two primitives |
| `--background-color-accent`, `--background-color-hover-accent`, `--border-color-accent` | `settings/colors.css` `:root` | none: the same primitive in both themes |
| `--box-shadow-shell-light`, `--box-shadow-shell-dark` | `settings/shadows.css` `:root` | the Layout module's `box-shadow` rules on `[data-theme="dark"]` + no-JS `@media` |
| Theme-independent: `--rem-scale`, `--f-*`, `--fw-*`, `--lh-*`, `--ls-*`, `--font-*`, `--spacing-*`, `--max-w-*`, `--height-nav`, `--border-025/05`, `--border-radius-*`, `--duration-*`, `--ease-*`, `--z-index-*` | `settings/*.css` `:root` | n/a (inherited by both themes) |

### 11.3 Provenance summary

- **Verified values** (cited [HL2]/[BM]/[GL]/[LK]) were all observed through Playwright in this session.
- **Proposed values** are adaptations, and every proposed color pairing has a computed contrast ratio in §3.4.
- **Not observed, so not claimed:** the exact DIN Pro metrics; galeed.link's console error contents; Linkd's social-icon gap; Black Mesa's below-the-fold card internals beyond buttons, articles, and labels.
