# Mermaid Live Editor (Privacy Fork)

Edit, preview and share mermaid charts/diagrams. This is a privacy-focused fork with all external services disabled.

## Privacy Features

- No analytics or tracking
- No external rendering services (mermaid.ink, kroki.io)
- No external API calls (GitHub Gist, Mermaid Chart)
- No CDN dependencies (font-awesome vendored locally)
- No promotional banners or third-party links
- Works entirely offline as a Progressive Web App

## Features

- Edit and preview flowcharts, sequence diagrams, gantt diagrams in real time.
- Save the result as a SVG or PNG (rendered locally)
- Get a link to a viewer of the diagram so that you can share it with others.
- Get a link to edit the diagram so that someone else can tweak it and send a new link back

## Docker

### Run published image

```bash
docker run --platform linux/amd64 --publish 8000:8080 ghcr.io/mermaid-js/mermaid-live-editor
```

### Development

```bash
docker compose up --build
```

Then open http://localhost:3000

### Building and running images locally

#### Build

```bash
docker build -t mermaid-js/mermaid-live-editor .
```

#### Run

```bash
docker run --detach --name mermaid-live-editor --publish 8080:8080 mermaid-js/mermaid-live-editor
```

Visit: <http://localhost:8080>

#### Stop

```bash
docker stop mermaid-live-editor
```

## Requirements

- [Node.js](https://nodejs.org/en/) current LTS version
- [pnpm](https://pnpm.io/) package manager. Install with `corepack enable pnpm`

## Development

```sh
pnpm install
pnpm dev -- --open
```

This app is created with Svelte Kit.

## Release

When a PR is merged to master, it will automatically be deployed via GitHub Pages.
