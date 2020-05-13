![Join our Slack!](https://img.shields.io/static/v1?message=join%20chat&color=9cf&logo=slack&label=slack)

# Contributors are welome

If you want to speed up the progress for mermaid-cli, join the slack channel and contact knsv.

# mermaid-live-editor

Edit, preview and share mermaid charts/diagrams.


## Features

- edit and preview flowcharts, sequence diagrams, gantt diagrams in real time.
- save the result as a svg
- get a link to a viewer of the diagram so that you can share it with others.
- get a link to edit the diagram so that someone else can tweak it and send a new link back


## Setup

Setup is simple.

```
yarn install
```
or in develop branch to use the beta version of mermaid use
```
yarn install --update-checksums
```

This together with a .npmrc file:
```
registry=https://registry.npmjs.com/
@mermaid-js:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken="XXXXXXXXX"

```


## Development

```
yarn dev
open http://localhost:1234
```

This app is created with Svelte + svelte-spa-router.


## Release

```
yarn release
```
