[![Join our Slack!](https://img.shields.io/static/v1?message=join%20chat&color=9cf&logo=slack&label=slack)](https://join.slack.com/t/mermaid-talk/shared_invite/enQtNzc4NDIyNzk4OTAyLWVhYjQxOTI2OTg4YmE1ZmJkY2Y4MTU3ODliYmIwOTY3NDJlYjA0YjIyZTdkMDMyZTUwOGI0NjEzYmEwODcwOTE)

# Contributors are welcome

If you want to speed up the progress for mermaid-cli, join the slack channel and contact knsv.

# mermaid-live-editor

Edit, preview and share mermaid charts/diagrams.


## Features

- Edit and preview flowcharts, sequence diagrams, gantt diagrams in real time.
- Save the result as a svg
- Get a link to a viewer of the diagram so that you can share it with others.
- Get a link to edit the diagram so that someone else can tweak it and send a new link back


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
open http://localhost:8080
```

This app is created with Svelte + svelte-spa-router.


## Release

```
yarn release
```
