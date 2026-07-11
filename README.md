[![Join our Discord!](https://img.shields.io/static/v1?message=join%20chat&color=9cf&logo=discord&label=discord)](https://discord.gg/sKeNQX4Wtj)
[![Netlify Status](https://api.netlify.com/api/v1/badges/27fa023d-7c73-4a3f-9791-b3b657a47100/deploy-status)](https://app.netlify.com/sites/mermaidjs/deploys)

# Mermaid Live Editor

Edit, preview and share [Mermaid](https://mermaid.js.org) charts and diagrams. A real-time, browser-based editor built with [SvelteKit](https://svelte.dev).

## Features

- **Real-time editing** — Edit diagram code with a Monaco Editor (desktop) or CodeMirror (mobile) and see updates instantly.
- **Broad diagram support** — Flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, Gantt charts, mind maps, pie charts, quadrant charts, Git graphs, user journeys, requirement diagrams, timelines, C4 context diagrams, architecture diagrams, block diagrams, Sankey diagrams, treemaps, XY charts, packet diagrams, kanban boards, and ZenUML.
- **Sample diagrams** — Load built-in examples for each diagram type via an example picker dropdown.
- **Presentation settings** — Switch layout engines (Auto, Dagre, ELK, Force, Stress), change visual look (Auto, Classic, Neo, Hand-Drawn), and manage accessibility metadata (`accTitle`, `accDescr`).
- **Hand-drawn mode** — Render diagrams with a sketchy style powered by `svg2roughjs`.
- **Pan & zoom** — Interactive panning and zooming in the diagram preview, plus a fullscreen view mode.
- **Dark and light themes** — Toggle between themes; editor and preview adapt automatically.
- **History & timeline** — Automatically saves a timeline every minute; manually bookmark states and restore them later. Import/export history as JSON.
- **Local AI assistant** — Chat with a local LLM via an OpenAI-compatible API (defaults to Ollama at `http://localhost:11434/v1`) to explain, edit, or repair diagrams. Includes a syntax-error repair button and accepts/rejects proposed changes.
- **AI prompt in editor** — Quick-access AI prompt glyph in the Monaco editor gutter to start vibe diagramming in Mermaid Chart.
- **Actions** — Download diagrams as PNG or SVG (with configurable size), copy as image to clipboard, copy Markdown link, or open in Kroki.
- **Sharing** — Generate shareable links to the live editor or the Mermaid Chart Playground.
- **GitHub Gist support** — Load diagram code directly from a Gist URL.
- **Mobile support** — Responsive layout with a mobile-optimized code editor and view toggle.
- **PWA-ready** — Can be installed as a progressive web app.

## Live demo

Try it out at [mermaid.live](https://mermaid.live/).

## Tech stack

- [SvelteKit](https://svelte.dev) & [Svelte 5](https://svelte.dev/docs/svelte/what-are-runes)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) (desktop) / [CodeMirror](https://codemirror.net/) (mobile)
- [Mermaid](https://mermaid.js.org) (diagram rendering engine)
- [Vitest](https://vitest.dev/) (unit tests) & [Playwright](https://playwright.dev/) (e2e tests)

## Setup

Fork the repository and clone it locally:

https://docs.github.com/en/get-started/quickstart/fork-a-repo

## Requirements

- [Node.js](https://nodejs.org/) `>=24.16.0`
- [pnpm](https://pnpm.io/) package manager. Install with `corepack enable pnpm`

## Development

```bash
pnpm install
pnpm dev -- --open
```

The dev server starts at `http://localhost:3000` by default.

### Available scripts

| Script                    | Description                              |
| ------------------------- | ---------------------------------------- |
| `pnpm dev`                | Start the Vite dev server                |
| `pnpm dev:force`          | Force start with local Mermaid overrides |
| `pnpm build`              | Create a production build                |
| `pnpm preview`            | Preview the production build locally     |
| `pnpm check`              | Run Svelte type checks                   |
| `pnpm lint`               | Run Prettier and ESLint checks           |
| `pnpm lint:fix`           | Format and auto-fix lint issues          |
| `pnpm test:unit`          | Run Vitest unit tests                    |
| `pnpm test:unit:coverage` | Run unit tests with coverage             |
| `pnpm test:e2e`           | Run Playwright end-to-end tests          |
| `pnpm test`               | Run both unit and e2e tests              |

## Docker

### Run the published image

```bash
docker run --platform linux/amd64 --publish 8000:8080 ghcr.io/mermaid-js/mermaid-live-editor
```

Visit: [http://localhost:8000](http://localhost:8000)

The published image is built with default environment variables. You cannot override them at runtime. To customize them, build the image yourself (see below).

### Development with Docker Compose

```bash
docker compose up --build
```

Visit: [http://localhost:3341](http://localhost:3341)

The compose file mounts `./src` for live reloading and uses the `mermaid-dev` target.

### Build and run images locally

#### Build

```bash
docker build -t mermaid-js/mermaid-live-editor .
```

#### Run

```bash
docker run --detach --name mermaid-live-editor --publish 8080:8080 mermaid-js/mermaid-live-editor
```

Visit: [http://localhost:8080](http://localhost:8080)

#### Stop

```bash
docker stop mermaid-live-editor
```

## Configuration

The following build-time arguments and environment variables can be used to customize the application (all prefixed with `MERMAID_`):

| Variable                                 | Default                     | Description                                                                                           |
| ---------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `MERMAID_RENDERER_URL`                   | `https://mermaid.ink`       | Rendering service for PNG/SVG thumbnails. Set to empty string to disable PNG/SVG links under Actions. |
| `MERMAID_KROKI_RENDERER_URL`             | `https://kroki.io`          | Kroki instance URL. Set to empty string to disable the Kroki link under Actions.                      |
| `MERMAID_ANALYTICS_URL`                  | _(empty)_                   | Plausible analytics instance URL.                                                                     |
| `MERMAID_DOMAIN`                         | _(empty)_                   | Domain for analytics.                                                                                 |
| `MERMAID_IS_ENABLED_MERMAID_CHART_LINKS` | _(empty)_                   | Set to `true` to enable Mermaid Chart save/playground links and promotional banners.                  |
| `MERMAID_DOCS_URL`                       | `https://mermaid.js.org`    | Base URL for documentation links shown in the editor.                                                 |
| `MERMAID_LLM_API_ENDPOINT`               | `http://localhost:11434/v1` | OpenAI-compatible API endpoint for the local AI chat feature (e.g., Ollama).                          |
| `MERMAID_LLM_MODEL`                      | `llama3.2`                  | Model name for local AI chat completions.                                                             |
| `MERMAID_HIDE_PRIVACY_POLICY`            | _(empty)_                   | Set to `true` to hide the privacy policy link.                                                        |
| `MERMAID_PRIVACY_POLICY_URL`             | _(empty)_                   | Custom privacy policy URL.                                                                            |
| `MERMAID_BASE_PATH`                      | _(empty)_                   | Base path for the application.                                                                        |

### To update the Security modal

The modal shown on clicking the security link assumes analytics, renderer, Kroki, and Mermaid Chart are enabled. You can update it by modifying `src/lib/components/Privacy.svelte` if you wish.

## Release

When a PR is created targeting `master`, it will be built and deployed by Netlify. The URL will be indicated in a comment in the PR.

Once the PR is merged, it will automatically be released.

# Contributors are welcome!

If you want to speed up the progress for mermaid-live-editor, join the [Discord channel](https://discord.gg/sKeNQX4Wtj) and contact knsv.
