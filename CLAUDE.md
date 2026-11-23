# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## galeed.link

Personal link hub. Astro 7 + TypeScript (strict) + global ITCSS styles + CSS
Modules + UnoCSS (layout only). Node 22.23.5 (`.nvmrc`; Astro 7 needs ≥
22.23.4), npm, ESM.

UI copy is Spanish (`<html lang="es">`). Code, comments, commit messages and
docs are English.

## Source of truth

- **`DESIGN_SYSTEM.md`** defines tokens, components, theming, motion and
  accessibility. Read the relevant section before touching UI. Don't load the
  whole file: it is large.
  - §2: theming
  - §3: color
  - §4: type
  - §5: layout
  - §7: components
  - §8: motion
  - §9: implementation
  - §10: checklist
- `**[V]**` marks values observed on the reference sites. `[P]` marks proposals.
  If code and the doc disagree, ask before changing either one.
- It overrides generic advice from any skill, e.g. Tailwind classes, color
  utilities or `outline: none`.

## Commands

| Task                 | Command                                       |
| -------------------- | --------------------------------------------- |
| Dev server           | `npm run dev`                                 |
| Dev server on LAN    | `npm run dev -- --host` (only when needed)    |
| Build                | `npm run build`                               |
| Preview build        | `npm run preview`                             |
| Lint TS/Astro/JSON   | `npm run lint` · `npm run lint:fix`           |
| Lint CSS             | `npm run stylelint` · `npm run stylelint:fix` |
| Format               | `npm run prettier` · `npm run prettier:fix`   |
| Lint Markdown        | `npm run lint-md` · `npm run lint-md:fix`     |
| Duplicate code       | `npm run check-for-dupes`                     |
| Type check           | `npx astro check`                             |
| Unit tests (Vitest)  | `npm run test`                                |
| Lighthouse (preview) | `npm run test:performance`                    |

- After editing CSS, run `npm run stylelint:fix`. It reorders properties
  (`order/properties-order`) and normalizes notation. That is expected.
- One test file: `npx vitest run tests/tokens.test.ts`.
- `npm run test:e2e` is defined, but Playwright is not installed and there are
  no end-to-end tests yet.
- `npm run test:performance` audits `http://localhost:4173/`: build, start
  `npm run preview` (pinned to 4173 so it never collides with the dev server on
  4321), then run it. Antivirus web shields that inject scripts (Kaspersky) skew
  the scores; add `--blocked-url-patterns` when one is active.

## Structure

- `src/styles/`: global ITCSS, one `index.css` of `@import`s per folder.
  - `settings/`: custom properties only. `:root` and the two `:root[data-theme]`
    color-scheme pins, no other selectors.
  - `tools/`: `@define-mixin` (type roles).
  - `generic/`: the `Barlow Fallback` face and the reset (`@layer reset`).
  - `elements/`: bare HTML elements, plus the global `:focus-visible`,
    `::selection` and `[id]` rules.
  - `atoms/`: global `a-` blocks (BEM): `a-button`, `a-link-action`, `a-chip`.
  - `utilities/`: imported last (`.sr-only`, `.skip-link`, theme switching).
- `src/components/<Name>/index.astro` + `styles.module.css`. `RepoCard` reuses
  the `LinkCard` module on purpose.
- `src/layouts/Layout/`: `<head>`, the inline theme script, fonts, the shell.
  SEO tags come from `astro-seo` (canonical, Open Graph, X card) and the JSON-LD
  from `astro-seo-schema`: one `@graph` with the `ProfilePage` → `Person` and
  one node per card (`src/data/worksSchema.ts`), each pointing back to the
  Person by `@id`. Build the nodes from the card models so the markup never
  claims more than the page shows.
- `src/data/personalSchema.ts`: identity data (`SITE_URL`, name, job title,
  `sameAs` links) shared by the JSON-LD, the meta tags, `PROFILE` and
  `/llms.txt`. Keep the canonical name spelling "Galeed Gutierrez".
- `src/pages/llms.txt.ts`: `/llms.txt` for AI answer engines (GEO), built from
  the same data as the page.
- `public/og.jpg`: 1200×630 link-preview card, rendered from the site's own
  tokens and fonts. Regenerate it when the name, role or portrait change.
- `src/pages/index.astro`: builds the section list. A section without data is
  left out of the page and the nav, and indices are renumbered.
- `src/data/hub.ts`: the only place that reads `@galeedgutierrez/shared-assets`.
  It maps projects to card models and holds `PROFILE` (location, availability,
  email) and `SOCIAL_LINKS`. Project content changes belong in shared-assets
  (`D:\Yo\proyectos-personales\shared-assets`), not here.
- `src/types/designTokens.ts`: token lists and card models.
  `src/scripts/theme.ts`: theme logic. `tests/`: Vitest (token invariants from
  §9.9).
- `scripts/`: post-build `purgeCss.ts`, `lightningcss.ts` and `subsetFonts.ts`.
- Path aliases in use: `@/*`, `@components/*`, `@layouts/*`, `@styles/*`,
  `@images/*`.

## CSS rules

- **Tokens:** primitives (`--bone-100`, `--hev-400`…) are private. Components
  only use applications named by property: `--background-color-*`,
  `--text-color-*`, `--border-color-*`, `--outline-color-*`.
  - Themed values are `light-dark(var(--a), var(--b))`.
  - **Never redefine a token under `[data-theme]`** or any other selector. The
    build inlines `:root` values, so the override would be lost.
    `tests/tokens.test.ts` enforces this.
  - New colors need a measured AAA ratio before they ship (§3.4–3.5).
- **Units:** write px values as `calc(<px> * var(--rem-scale))`. Fluid sizes use
  `utopia.clamp(min, max)`. Breakpoints are literal `em` in range syntax:
  `@media (width >= 40em)` / `48em` / `64em` / `90em`. `var()` doesn't work in
  `@media`.
- **Color syntax:** `oklch()` only. stylelint forbids hex and `rgb/hsl/lab/hwb`.
  For tints use `color-mix(in oklab, …)`, never `in oklch` with neutrals.
- **Type:** use the mixins `heading-xl`, `heading-lg`, `heading-md`, `body-lg`,
  `body-md`, `body-sm`, `label`, `micro`.
  - stylelint's `order/order` puts at-rules (`@mixin`, `@media`) after
    declarations and nested rules, so a sibling declaration can't override a
    mixin property. Use the mixin's parameter instead
    (`@mixin body-md var(--fw-bold)`).
  - Only Barlow 400/500/700/800 ship.
- **Naming:** global atoms are BEM with an `a-` prefix (`.a-button--primary`).
  CSS Module classes are BEM with the component as the block
  (`styles["navbar__link"]`).
- **UnoCSS is layout only:** display, flex/grid, gap, spacing, sizing, position,
  overflow, aspect-ratio. Never color, type, border, radius, shadow or
  transition utilities: `uno.config.ts` blocklists them, so they generate
  nothing. Prefer logical properties (`inline-size`, `margin-block-start`).
- **No `!important`** (stylelint). The single exception is
  `[data-theme-switching]`, which has a scoped disable comment.
- **Motion:** animate only `transform`/`translate`/`scale`, `opacity` and
  colors.
  - Each effect opts in under `@media (prefers-reduced-motion: no-preference)`
    next to its own rule.
  - No global reduced-motion override.
  - Hover transforms also need `(hover: hover)`.

## Astro and ESLint gotchas

- Don't use Astro's shorthand attributes (`<h2 {id}>`, `<Card {item} />`). They
  crash the `jsx-a11y-x` ESLint rules. Write `id={id}`.
- ESLint 10 uses `eslint-plugin-jsx-a11y-x`, a fork with the same rules under
  the `jsx-a11y-x/` prefix: `eslint-plugin-jsx-a11y` doesn't support ESLint 10.
- Unicorn is scoped to code files: ESLint 10 rejects its rules on JSON. Two of
  its style rules are off because they fight the JSDoc/TSDoc comment style.
- Lists keep `role="list"`; ESLint allows it on `ul` only.
- `setAttribute('data-theme…')` in `theme.ts` has a scoped
  `unicorn/dom-node-dataset` disable: PurgeCSS needs the literal names.

## Theming

- An inline `is:inline` script in `<head>` writes the resolved theme with
  `setAttribute('data-theme', …)` before first paint. Keep `setAttribute` (not
  `dataset`): PurgeCSS needs the literal token.
- Two-state toggle, storage key `galeed:theme`. The rules:
  - A flip that matches the OS clears the key.
  - A stored override is never cleared retroactively.
  - Logic is in `src/scripts/theme.ts`; see §2.3 before changing it.
- `:root { color-scheme: light dark }` must stay the base, so the site follows
  the OS without JS.

## Accessibility (WCAG 2.2 AAA)

- Text ≥ 7:1, UI boundaries and focus ≥ 3:1, in both themes. Never fade text
  with `opacity`/alpha.
- Never `outline: none`. The single focus ring is in `elements/global.css`.
- Touch targets ≥ 44px. Icon-only controls get an `sr-only` name. Icons come
  from `astro-icon` (Lucide for UI, Simple Icons for brands). No emoji as icons.
- Lists styled with `list-style: none` that matter (nav, social, chips) carry
  `role="list"`.
- Color is never the only signal (status chips have text, links in prose are
  underlined).

## Build pipeline gotchas

- Build order is `astro build && purge-css && lightningcss && subset-fonts`.
  lightningcss must come after purge-css: `purgeCss.ts` re-runs
  `postcss-custom-properties`, which would inline the `light-dark()` polyfill
  switches and pin every color to light. `subset-fonts` must stay last: it
  renames fonts and style sheets by content hash, so any later step that
  rewrites the CSS would leave a stale hash.
- `subsetFonts.ts` keeps only the characters in the built HTML (plus CSS
  `content`, both cases and a small margin). Text a client script inserts at
  runtime isn't in the HTML: add its characters to `SAFETY_CHARACTERS`.
- `postcss-custom-properties({ preserve: false })` inlines `:root` variables.
  Per-selector token overrides silently disappear.
- PurgeCSS only sees static HTML/JS. Attributes set at runtime need a safelist
  entry by **attribute name** (`/^data-theme/`, `'aria-current'`). Patterns like
  `/^\[data-.*\]$/` or `/^@media/` match nothing. `fontFace` is off because it
  dropped the `Barlow Fallback` face. `variables` is off because it deleted
  tokens still in use (the sticky nav's `z-index`, motion tokens, the shell's
  radius and shadow), so `var()` resolved to nothing.
- `purgeCss.ts` has a custom `defaultExtractor`. The default one split UnoCSS
  arbitrary values (`grid-cols-[1fr_1px_1fr]`, `aspect-[5/4]`) at the brackets,
  so they were silently purged. After adding an arbitrary class, check it
  survives in `dist/_astro/*.css`.
- `purgeCss.ts` passes the CSS to PurgeCSS as `raw` text. PurgeCSS 9 globs `css`
  paths, and an absolute Windows path (backslashes) matched nothing, so the step
  silently purged nothing.
- `@galeedgutierrez/shared-assets` is in `vite.resolve.noExternal`: it imports
  its screenshots and `svg?raw` icons, which plain Node can't load at prerender.
  Not `vite.ssr.noExternal`: Astro 7 prerenders in a separate `prerender` Vite
  environment that ignores it. It also makes Vite emit every project screenshot
  into `dist/`, even unused ones.
- `compressHTML: true` is set on purpose. Astro 7's default (`'jsx'`) drops the
  whitespace between inline elements ("© 2026Galeed").
- `Barlow Fallback` and `JetBrains Mono Fallback*` metrics come from Capsize
  (`@capsizecss/core` + `@capsizecss/metrics`; Consolas via `@capsizecss/unpack`
  from `consola.ttf`, since Capsize ships no metrics for it). Regenerate them;
  don't edit by hand.
- Analytics: `gtag` runs in Partytown and must be assigned to `window.gtag`
  (Partytown wraps inline scripts in a function, so a declared `gtag` stays
  local). Web Vitals run on the main thread from the `web-vitals` package: in a
  worker, `PerformanceObserver` has no LCP, layout-shift or event entries.

## Skills and tools

- **CSS/HTML/client JS:** run `modern-web-guidance` first, then follow
  `DESIGN_SYSTEM.md`.
- **UI/UX decisions:** `ui-ux-pro-max`.
- **fullstack-dev-skills** (user-level plugin):
  - `typescript-pro`: `theme.ts`, types, build scripts
  - `javascript-pro`: client scripts
  - `playwright-expert`: end-to-end
  - `test-master`: Vitest
  - `code-reviewer`, `debugging-wizard`
  - `/fullstack-dev-skills:common-ground:common-ground` before larger tasks
  - Not applicable: the React/Next/Vue/Angular skills and the Jira `project:*`
    workflow commands.
- **Security:** `security-audit` for audits.
- **GitHub:** the GitHub MCP for issues and PRs (`gh` also works).

## Workflow

- Conventional Commits (commitlint). Commits are GPG-signed: if signing fails
  with "No hay ningún agente en ejecución", start Kleopatra / `gpg-agent`. Never
  bypass signing or hooks.
- Husky hooks:
  - pre-commit: `lint-staged` + `check-for-dupes`.
  - pre-push: the same. Tests are commented out there, so run `npm run test`
    yourself before a PR.
- `check-for-dupes` ignores `.agents/` and `.claude/`: the installed skill is
  symlinked into both, which doubled every file.
- Work on a branch, never directly on `main`.
- CI runs lint, stylelint, lint-md, prettier and check-for-dupes. A PR must pass
  all of them.
