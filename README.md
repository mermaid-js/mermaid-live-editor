[![Join our Discord!](https://img.shields.io/static/v1?message=join%20chat&color=9cf&logo=discord&label=discord)](https://discord.gg/sKeNQX4Wtj)
[![Netlify Status](https://api.netlify.com/api/v1/badges/27fa023d-7c73-4a3f-9791-b3b657a47100/deploy-status)](https://app.netlify.com/sites/mermaidjs/deploys)

# Mermaid Live Editor

Edit, preview and share mermaid charts/diagrams.

## Features

- Edit and preview flowcharts, sequence diagrams, gantt diagrams in real time.
- Save the result as a svg
- Get a link to a viewer of the diagram so that you can share it with others.
- Get a link to edit the diagram so that someone else can tweak it and send a new link back

## Live demo

You can try out a [live version](https://mermaid.live/).

# Contributors are welcome!

If you want to speed up the progress for mermaid-live-editor, join the Discord channel and contact knsv.

## Docker

### Run published image

```bash
docker run --platform linux/amd64 --publish 8000:8080 ghcr.io/mermaid-js/mermaid-live-editor
```

The published docker image is built using our default environment variables. You cannot override them when running the image. If you need to customize them, you will need to build the image yourself.

### Health check

The image serves static files with nginx on port `8080`. There is no separate health check endpoint: point your health check at `/` on port `8080`, which returns `200` once nginx is up.

### Environment variables

All variables are optional and are read at build time only, so pass them as `--build-arg` when building the image (see [Building and running images locally](#building-and-running-images-locally)). Unset variables fall back to the values in [`.env`](./.env).

| Variable                                 | Default               | Description                                                                                                    |
| ---------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `MERMAID_RENDERER_URL`                   | `https://mermaid.ink` | Rendering service for the PNG and SVG links. Empty disables them.                                              |
| `MERMAID_KROKI_RENDERER_URL`             | `https://kroki.io`    | Kroki instance for the Kroki link. Empty disables it.                                                          |
| `MERMAID_ANALYTICS_URL`                  | empty                 | Plausible instance. Empty disables analytics.                                                                  |
| `MERMAID_DOMAIN`                         | empty                 | Domain reported to Plausible.                                                                                  |
| `MERMAID_IS_ENABLED_MERMAID_CHART_LINKS` | `true`                | Set to anything other than `true` to hide the Save to Mermaid Chart button and the promotional banner.         |
| `MERMAID_PRIVACY_POLICY_URL`             | empty                 | Link to your privacy policy, opened from the privacy button.                                                   |
| `MERMAID_HIDE_PRIVACY_POLICY`            | empty                 | Set to `true` to hide the privacy button.                                                                      |
| `MERMAID_BASE_PATH`                      | empty                 | Base path when the editor is served from a sub-path (e.g. `/mermaid`). Must start with `/`, no trailing slash. |

For example, to disable the PNG, SVG and Kroki links:

```bash
docker build --build-arg MERMAID_RENDERER_URL='' --build-arg MERMAID_KROKI_RENDERER_URL='' -t mermaid-js/mermaid-live-editor .
```

### To update the Security modal

The modal shown on clicking the security link assumes analytics, renderer, Kroki
and Mermaid chart are enabled. You can update it by modifying `Privacy.svelte`
if you wish.

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

## Setup

Below link will help you making a copy of the repository in your local system.

https://docs.github.com/en/get-started/quickstart/fork-a-repo

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

When a PR is created targeting master, it will be built and deployed by Netlify.
The URL will be indicated in a Comment in the PR.

Once the PR is merged, it will automatically be released.
