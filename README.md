# galeed.link

Personal link hub built with Astro, TypeScript, and modern web technologies. The
site intentionally keeps content compressed; detailed project write-ups live on
[galeedgutierrez.com](https://galeedgutierrez.com/).

## 📋 Requirements

- [Node.js](https://nodejs.org/) >= 26.13.1 (`.nvmrc` pins this version)
- npm >= 12.2.3

## 🚀 Getting started

```sh
nvm use
npm ci
npm run dev
```

The development server runs at `http://localhost:4321`.

## 🗂️ Project structure

```text
/
├── public/             # Static files and generated-site assets
├── src/
│   ├── assets/         # Images processed by Astro
│   ├── components/     # Astro components and CSS Modules
│   ├── data/           # Content models, shared-data mapping, and JSON-LD
│   ├── icons/          # Local astro-icon collection
│   ├── layouts/        # Page shell, metadata, fonts, and analytics
│   ├── pages/          # Routes and generated text/manifest endpoints
│   ├── scripts/        # Browser-side behavior
│   ├── styles/         # Global ITCSS style sheets
│   ├── types/          # Shared TypeScript models
│   └── utils/          # URL and Markdown helpers
├── tests/              # Vitest and Playwright tests
├── astro.config.mjs    # Astro integrations and post-build pipeline
└── package.json        # Dependencies and project commands
```

Generated output and reports (`dist/`, `.lighthouseci/`, and
`lighthouse-report/`) are not source directories.

## 🛠️ Tech stack

- **Framework:** [Astro](https://astro.build/) 7 with static output
- **Language:** TypeScript in strict mode
- **Styling:** global ITCSS, CSS Modules, PostCSS, and UnoCSS layout utilities
- **Content:** local page data plus `@galeedgutierrez/shared-assets`
- **Linting:** ESLint, Prettier, stylelint, markdownlint, and textlint
- **Testing:** Vitest, Playwright, and axe-core
- **Performance:** Lighthouse and Lighthouse CI
- **Code quality:** Husky, lint-staged, and jscpd

## 🧞 Commands

Run all commands from the project root:

<!-- markdownlint-disable MD013 -->

| Command                    | Action                                                    |
| :------------------------- | :-------------------------------------------------------- |
| `npm ci`                   | Install the locked dependency versions                    |
| `npm run dev`              | Start the development server                              |
| `npm run build`            | Build the production site in `dist/`                      |
| `npm run preview`          | Preview the production build on port 4173                 |
| `npm run lint`             | Lint TypeScript, Astro, JSON, and YAML                    |
| `npm run stylelint`        | Lint CSS                                                  |
| `npm run prettier`         | Check formatting                                          |
| `npm run lint-md`          | Lint Markdown and terminology                             |
| `npm run check-for-dupes`  | Check for duplicate code                                  |
| `npm run lint:all`         | Run every linter, including formatting and duplication    |
| `npm run typecheck`        | Run `astro check`                                         |
| `npm run test`             | Run the Vitest unit tests                                 |
| `npm run test:e2e`         | Run Playwright accessibility tests against the built site |
| `npm run test:performance` | Run Lighthouse against the preview server                 |
| `npm run verify`           | Run all linters, type checking, and unit tests            |
| `npm run commit`           | Create a commit with the Conventional Commits prompt      |
| `npx lhci autorun`         | Run the Lighthouse CI assertions after building           |

<!-- markdownlint-enable MD013 -->

Most lint and formatting commands have a `:fix` variant. Those variants modify
files; review the resulting changes before committing.

### Accessibility tests

Install Chromium once, then build before running the Playwright suite:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

The suite runs axe against every page in both color schemes and at desktop and
mobile widths. Some contrast and interaction cases still require manual checks;
see `CLAUDE.md` for the current limitations.

### Performance checks

Build and start the preview server, then run Lighthouse from another terminal:

```sh
npm run build
npm run preview
```

```sh
npm run test:performance
```

CI uses `npx lhci autorun` after the build and enforces the budgets configured
in `lighthouserc.mjs`.

## 🔧 Project conventions

- `DESIGN_SYSTEM.md` is the source of truth for tokens, components, theming,
  motion, and accessibility.
- Project content comes from `@galeedgutierrez/shared-assets`; update that
  package rather than duplicating project content locally.
- UI copy is Spanish. Code, comments, commits, and documentation are English.
- Use a branch for every change; do not work directly on `main`.

See `CLAUDE.md` for the architecture, build pipeline, shared configuration
packages, and tooling details.

## 🤝 Contributing

1. Fork the repository and create a branch:

   ```sh
   git switch -c docs/my-change
   ```

2. Make the change and keep its tests and documentation alongside it.
3. Run `npm run verify`. For browser-facing changes, also run the end-to-end
   suite.
4. Commit with `npm run commit` and a Conventional Commit message. Keep GPG
   signing and the Git hooks enabled.
5. Push the branch and open a pull request.

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

## 👤 Author

Galeed Gutierrez

- Email: <galeedeveloper@gmail.com>
- Site: [galeedgutierrez.com](https://galeedgutierrez.com/)
- GitHub: [@GaleedGutierrez](https://github.com/GaleedGutierrez)
