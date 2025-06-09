# Idem Chart

<div align="center">
  <img src="public/assets/icons/logo_white.png" alt="Idem Logo" width="200">
  <p><strong>Interactive Diagram Editor Module for the Idem Platform</strong></p>
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Netlify Status](https://api.netlify.com/api/v1/badges/27fa023d-7c73-4a3f-9791-b3b657a47100/deploy-status)](https://app.netlify.com/sites/mermaidjs/deploys)

## 🚀 Overview

Idem Chart is a specialized module of the Idem platform, designed for editing, previewing, and sharing diagrams. As part of the AI-powered Idem software development lifecycle system, this module specializes in the visualization aspect, enabling developers to create and modify flowcharts, sequence diagrams, and other visual representations of their software architecture.

## ✨ Features

As part of the Idem ecosystem, this module provides powerful diagram capabilities:

- **Interactive Diagram Editor**: Edit and preview flowcharts, sequence diagrams, gantt diagrams in real time
- **Export Options**: Save results as SVG files for easy integration into documentation
- **Collaboration Tools**: Share diagrams with team members via viewer links
- **Version Management**: Collaborate through editable diagram links for iterative design
- **UML Visualization**: Create detailed UML diagrams for system architecture documentation
- **Integration Support**: Seamlessly integrate with other Idem modules for complete software lifecycle management

## 🛠️ Tech Stack

- **Frontend**: Svelte Kit
- **Diagram Rendering**: Mermaid.js
- **Package Manager**: pnpm
- **Deployment**: Netlify

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) current LTS version
- [pnpm](https://pnpm.io/) package manager. Install with `corepack enable pnpm`

### Live Demo

You can try out a live version [here](https://mermaid.live/).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/idem-chart.git
   cd idem-chart
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev -- --open
   ```

4. Open your browser to view the application at the URL shown in your terminal

## Docker

### Run published image

```bash
docker run --platform linux/amd64 --publish 8000:8080 ghcr.io/idem-js/idem-chart
```

### To configure renderer URL

When building set the MERMAID_RENDERER_URL build argument to the rendering
service.
Example:
Default is`https://mermaid.ink`.
Set to empty string to disable PNG and SVG links under Actions

### To configure Kroki Instance URL

When building set the MERMAID_KROKI_RENDERER_URL build argument to your Kroki
instance.
Default is `https://kroki.io`
Set to empty string to disable Kroki link under Actions

### To configure Analytics

When building set the MERMAID_ANALYTICS_URL build argument to your plausible instance, and MERMAID_DOMAIN to your domain.

Default is empty, disabling analytics.

### To enable Mermaid Chart links and promotion

When building set the MERMAID_IS_ENABLED_MERMAID_CHART_LINKS build argument to `true`

Default is empty, disabling button to save to Mermaid Chart and promotional banner.

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
docker build -t idem-js/idem-chart .
```

#### Run

```bash
docker run --detach --name idem-chart --publish 8080:8080 idem-js/idem-chart
```

Visit: <http://localhost:8080>

#### Stop

```bash
docker stop idem-chart
```

## Development

```sh
pnpm install
pnpm dev -- --open
```

This app is created with Svelte Kit.

## Release Process

When a PR is created targeting master, it will be built and deployed by Netlify.
The URL will be indicated in a Comment in the PR.

Once the PR is merged, it will automatically be released.

## 🧪 Testing

### Unit Tests

To run unit tests for the application:

```bash
npm test
```

## 🏗️ Building

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 📝 Documentation

For detailed documentation about using the diagram editor, please visit [our wiki](https://github.com/yourusername/idem/wiki/chart).

To learn more about the entire Idem platform and how this module integrates with other components, visit the [main Idem documentation](https://github.com/yourusername/idem/wiki).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get involved.

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📄 License

Idem is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

[List core team members here]

## 🙏 Acknowledgements

- [List libraries, tools, and resources that helped build Idem]
- [List contributors and supporters]

---

<div align="center">
  <p>Built with ❤️ by the Idem team</p>
</div>
