# Repository Guidelines

## Project Structure & Module Organization

This is a SvelteKit and TypeScript application for the Mermaid Live Editor. Route entry points live in `src/routes/`, shared UI and editor components in `src/lib/components/` (including `src/lib/components/Chat/` for the local AI chat panel), and utility/state code in `src/lib/util/` and `src/lib/`. Notable utilities include `localAI.ts` (OpenAI-compatible streaming LLM client) and `presentation.ts` (layout/look/accessibility helpers). Static assets, icons, manifests, and service worker files are in `static/`. End-to-end tests are in `tests/`; colocated unit tests use `*.test.ts` near the code, such as `src/lib/util/stats.test.ts` and `src/lib/util/presentation.test.ts`.

## Build, Test, and Development Commands

Use pnpm with the pinned package manager in `package.json`.

- `pnpm install`: install dependencies and run setup hooks.
- `pnpm dev -- --open`: start the local Vite dev server and open the app.
- `pnpm build`: produce the production build.
- `pnpm preview`: serve the build locally.
- `pnpm check`: run Svelte type checks against `tsconfig.json`.
- `pnpm lint`: run Prettier checks and ESLint.
- `pnpm lint:fix`: format and auto-fix lint issues.
- `pnpm test:unit`: run Vitest tests.
- `pnpm test:e2e`: run Playwright tests.
- `pnpm test`: run unit and e2e suites.
- `docker compose up --build`: run Docker at `http://localhost:3000`.

## Coding Style & Naming Conventions

Follow existing Svelte 5, TypeScript, and Tailwind CSS patterns. Prettier enforces single quotes, no trailing commas, 100-column width, Svelte section order, and Tailwind class ordering. Name Svelte components in PascalCase (`DesktopEditor.svelte`) and utilities in camelCase or descriptive lowercase modules (`domainMigration.ts`, `state.svelte.ts`). Keep route files aligned with SvelteKit conventions such as `+page.svelte`, `+layout.svelte`, and `+layout.ts`.

## Testing Guidelines

Use Vitest for unit tests and Playwright for browser flows. Put focused unit tests beside implementation files with `*.test.ts`; place cross-page or user-flow tests in `tests/*.spec.ts`. Prefer observable behavior over implementation details. Run `pnpm test:unit` for quick checks, `pnpm test:e2e` for browser coverage, and `pnpm test` before larger pull requests.

## Commit & Pull Request Guidelines

Recent history uses short imperative commits with optional scopes, for example `feat: add example picker dropdown to sample diagrams`, `fix: Treat a stored JSON null as a missing persisted value`, and `refactor: Route every input state mutation through one untracked gateway`. Keep commits focused. Pull requests should include a concise description, linked issues, validation steps, and screenshots or recordings for visible UI changes.

## Security & Configuration Tips

Do not commit local secrets or environment files. Keep `.env` local and document required variables instead. When changing renderer, Kroki, analytics, or Mermaid Chart behavior, update related UI copy and verify Docker/build-time configuration paths in `README.md`.
