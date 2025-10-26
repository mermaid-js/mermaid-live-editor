# Mermaid Renderer

A zero-UI, single-page Mermaid renderer built with SvelteKit. Point the browser to the app
with Mermaid syntax encoded in the URL and it will render a full-viewport, pannable and
zoomable SVG that can be embedded anywhere (including mobile WebViews).

## Quick start

```bash
pnpm install
pnpm start
```

The development server runs on <http://localhost:5173> by default.

To generate a production bundle:

```bash
pnpm build
pnpm preview
```

## Passing diagrams through the URL

The renderer reads Mermaid syntax and theme configuration from query parameters. Provide
at least one of `code`, `diagram`, `data`, `codeBase64`, or `code_b64`. If nothing is
provided, a sample diagram is rendered.

| Parameter                      | Purpose                                           |
| ------------------------------ | ------------------------------------------------- |
| `code` / `diagram` / `data`    | Mermaid definition (URI encoded).                 |
| `encoding=base64`              | Treats the `code` value as base64.                |
| `codeBase64` / `code_b64`      | Mermaid definition encoded in base64.             |
| `theme`                        | Mermaid theme (`default`, `dark`, `forest`, ...). |
| `background` / `bg`            | Background colour of the page and SVG.            |
| `primaryColor` / `primary`     | Node fill colour.                                 |
| `secondaryColor` / `secondary` | Secondary node fill colour.                       |
| `accentColor` / `accent`       | Accent colour (tertiary areas).                   |
| `lineColor` / `line`           | Edge and border colour.                           |
| `textColor` / `text`           | Text colour override.                             |
| `fontFamily` / `font`          | Font family applied to the SVG and container.     |

Example:

```
https://your-host/?code=graph%20TD%0AA%5BStart%5D--%3E%7CActions%7C%20B%5BRender%5D&background=%230b1c2c&text=%23f7fafc&primary=%231f6feb
```

All parameters are optional; sensible defaults keep the renderer usable without any input.

## Embedding tips

- The application fills the viewport (`100vw` × `100dvh`), making it easy to place inside an
  iframe or WebView.
- Pan and zoom gestures work with both mouse and touch input thanks to
  [`svg-pan-zoom`](https://github.com/svgdotjs/svg.pan-zoom.js).
- Errors while parsing or rendering Mermaid are surfaced in-place so hosts can react or
  display fallback UI around the iframe.

## Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the high-level structure of the renderer and
how the query parameters map into the rendering pipeline.
