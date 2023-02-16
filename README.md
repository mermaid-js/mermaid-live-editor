# mermaid-live-editor-desktop

Edit, preview and share mermaid charts/diagrams in a desktop window!
(This is a fork of https://github.com/mermaid-js/mermaid-live-editor just bundled with Tauri)

## Features

- Edit and preview flowcharts, sequence diagrams, gantt diagrams in real time in a windowed desktop app!
- Save the result as a svg (broken atm)
- Get a link to a viewer of the diagram so that you can share it with others. (broken atm)
- Get a link to edit the diagram so that someone else can tweak it and send a new link back (broken atm)

## Setup

Below link will help you making a copy of the repository in your local system.

https://docs.github.com/en/get-started/quickstart/fork-a-repo

## Requirements

- [volta](https://volta.sh/) to manage node versions.
- [Node.js](https://nodejs.org/en/). `volta install node`
- [yarn](https://yarnpkg.com/) package manager. `volta install yarn`

## Development

```sh
yarn install
yarn tarui dev
```

## Build

```sh
yarn install
yarn tarui build
```

This app is created with Svelte Kit.
