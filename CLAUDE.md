# CLAUDE.md

## Commands

Uses pnpm (install via `corepack enable pnpm`). Node >= 24 required.

- `pnpm dev` — dev server on http://localhost:3000
- `pnpm build` — production build (static site, output to `docs/`)
- `pnpm check` — svelte-check type checking
- `pnpm lint` / `pnpm lint:fix` — prettier + eslint
- `pnpm test:unit` — vitest in watch mode; `pnpm vitest run` for a single pass
- Single unit test: `pnpm vitest run src/lib/util/serde.test.ts` (or `-t "test name"`)
- `pnpm test:e2e` — Playwright tests in `tests/`; auto-starts the dev server on port 3000 (reuses one already running). `pnpm test:e2e:ui` / `:debug` for interactive runs
- `pnpm test` — unit + e2e

Gotchas:

- If `.claude/worktrees/` contains repo copies, vitest picks up their test files too — scope with `pnpm vitest run --dir src`.
- Local Playwright runs can be flaky under parallel workers; retry or use `--workers=1` before assuming a real failure.
- CI runs lint, check, unit tests, and Playwright (against a production build) on PRs to master.

## Architecture

SvelteKit 2 + Svelte 5 (runes) SPA using `@sveltejs/adapter-static`. **`docs/` is build output** (GitHub Pages convention) — never edit it. Routes: `/` (redirects), `/edit` (main editor), `/view` (read-only viewer).

### State flow (the core of the app)

`src/lib/util/state.svelte.ts` is the single source of truth:

- `inputState` — a `$state` rune holding `State` (code, mermaid config JSON, pan/zoom, etc.), initialized from localStorage key `codeStore`. **All writes must go through the exported update functions** (`updateCode`, `updateCodeStore`, `updateConfig`, `replaceInputState`, ...), which call `persistAndProcess()`: persist to localStorage → async re-validate via `mermaid.parse` → publish to `validatedState`. Reads inside update functions are wrapped in `untrack` so calling effects don't depend on the whole input state.
- `validatedState` — read-only validated snapshot (adds `error`, `errorMarkers`, `serialized`, `diagramType`). Internal reads should use this, but it is never persisted or shared externally.
- The serialized state is mirrored into the URL hash (debounced) — the URL **is** the sharing mechanism. `src/lib/util/serde.ts` encodes state as `pako:<base64 deflate>` (legacy plain-base64 supported). `mermaid.ink` PNG/SVG links, Kroki, and Mermaid Chart URLs are derived from it in `urls`.
- App startup goes through `initHandler()` in `src/lib/util/util.ts`: migrations → load state from URL hash → optional gist/URL loading (`fileLoaders/`) → start URL-hash subscription → analytics.

### Persistence

`src/lib/util/persist.svelte.ts` provides `readJSON`/`writeJSON` and a `persisted()` localStorage-backed rune, shared by state, migrations (`migrations.svelte.ts`), promos, and History. History (`src/lib/components/History/historyState.svelte.ts`) auto-saves a timeline of diagrams for the whole session (`startAutoSave()` in the edit page).

### Rendering

`src/lib/util/mermaid.ts` wraps mermaid and registers the ELK and tidy-tree layout engines plus ZenUML at module load. `View.svelte` renders the diagram; `panZoom.ts` wraps svg-pan-zoom; "rough" hand-drawn mode uses svg2roughjs. Sample diagrams come from `@mermaid-js/examples`.

### Editors

Two editor implementations behind `Editor.svelte`: Monaco for desktop (`DesktopEditor.svelte`; custom mermaid language, completions, and error markers in `monacoExtra.ts`) and CodeMirror for mobile (`MobileEditor.svelte`). Both edit either the diagram code or the mermaid config JSON depending on `editorMode`.

### Security

States loaded from URLs pass through `sanitizeConfig` (state.svelte.ts), which detects unsafe mermaid config (XSS vectors, prototype pollution, `secure` keys) and asks the user before stripping it. Keep this in mind when touching anything that deserializes external state.

### UI / styling

- shadcn-svelte components live in `src/lib/components/ui/` (bits-ui based, registry config in `components.json`) — treat as vendored; several lint rules are disabled there.
- Tailwind CSS 4 (via `@tailwindcss/vite`).
- Icons via unplugin-icons: `import X from '~icons/material-symbols/...'`; custom icons load from `static/icons` under `~icons/custom/*`.
- Path alias: `$/*` → `src/lib/*` (in addition to SvelteKit's `$lib`).

### Environment / build quirks

- Env vars use the `MERMAID_` prefix (`import.meta.env`), read in `src/lib/util/env.ts`. Defaults in `.env`; copy to `.env.local` for local overrides. These control renderer URL (mermaid.ink), Kroki, analytics, and Mermaid Chart integration.
- HMR is deliberately disabled — every change triggers a full page reload (see `alwaysFullReload` in `vite.config.js`) because HMR corrupts app state.
- `vite.config.js` pins monaco/mermaid/codemirror into named vendor chunks for long-term caching — keep that intact when touching build config.

## Conventions

- ESLint enforces alphabetically sorted object keys in `src/` for objects with 5+ keys (`sort-keys/sort-keys-fix`), plus typescript-eslint strict and unicorn rules.
- Unit tests are colocated with source (`*.test.ts` in `src/`); vitest runs with jsdom and also supports in-source tests (`import.meta.vitest`). Playwright e2e specs live in `tests/` and use `data-testid` constants from `src/lib/constants.ts` (`TID`).
