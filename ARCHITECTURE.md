# Mermaid Renderer Architecture

## Overview

The project is a SvelteKit single-page application whose only responsibility is to render
Mermaid diagrams. It starts without navigation or auxiliary UI so it can be embedded in
host applications (for example React Native WebViews) that only need a responsive SVG
renderer.

```
Browser URL ➜ SvelteKit route (+page.svelte) ➜ Mermaid renderer ➜ SVG output with pan/zoom
```

## Entry Points

- **`src/routes/+layout.svelte`** – Provides the minimal shell, loads the global stylesheet,
  and renders the single page component.
- **`src/routes/+page.svelte`** – Reads URL parameters, builds Mermaid configuration,
  renders the diagram, and wires pan/zoom capabilities. This is the heart of the
  application and runs entirely on the client (`ssr` is disabled in `+layout.ts`).

## Rendering Flow

1. On mount the page component reacts to `$page.url.searchParams` and merges them with
   defaults.
2. The Mermaid code is decoded (supporting raw strings, URI encoded strings, and base64
   variants) with a fallback example diagram when no code is provided.
3. A Mermaid configuration object is built from theming parameters (background, colors,
   fonts, etc.) and passed to `renderMermaid` (`src/lib/util/mermaid.ts`).
4. The resulting SVG replaces the surface DOM node. The SVG is stretched to fill the
   viewport and initialised with `svg-pan-zoom` so the host can pan and zoom with touch or
   mouse input.
5. Errors during rendering are surfaced in-place without breaking the host frame.

## Query Parameters

| Parameter                    | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `code`, `diagram`, or `data` | Mermaid definition (URI encoded).                        |
| `codeBase64` / `code_b64`    | Base64 encoded Mermaid definition.                       |
| `encoding=base64`            | Tells the renderer to treat the `code` value as base64.  |
| `theme`                      | Mermaid theme name (`default`, `dark`, `neutral`, etc.). |
| `background`/`bg`            | Page and SVG background color.                           |
| `primaryColor`/`primary`     | Primary node color.                                      |
| `secondaryColor`/`secondary` | Secondary node color.                                    |
| `accentColor`/`accent`       | Accent color used for tertiary areas.                    |
| `lineColor`/`line`           | Edge and border color.                                   |
| `textColor`/`text`           | Text color overrides.                                    |
| `fontFamily`/`font`          | Font family applied to the SVG and container.            |

Any parameter can be omitted; reasonable defaults are supplied to keep the renderer usable
without configuration.

## Styling and Responsiveness

- The renderer uses a single flex container (`.renderer`) that stretches to `100vw` by
  `100dvh`, ensuring it consumes the full viewport.
- The SVG is forced to `width: 100%` and `height: 100%` so that `svg-pan-zoom` can manage
  the viewBox while keeping the diagram responsive.
- Errors are displayed via an overlay so embedding hosts can still size the iframe/webview
  consistently.

## Development Notes

- Start the app with `pnpm start` (alias for `pnpm dev`) for a local development server.
- Static builds work with `pnpm build`; the result is a fully client-side bundle that can
  be hosted on any static file server.
