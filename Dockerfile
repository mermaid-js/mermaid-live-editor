# Two-stage  docker container for mermaid-js/mermaid-live-editor
# Build using node   : docker build -t mermaid-js/mermaid-live-editor .
# Run using httpd    : docker run --name mermaid-live-editor --publish 8080:80 mermaid-js/mermaid-live-editor
# Start              : docker start mermaid-live-editor
# Use webbrowser     : http://localhost:8080
# Stop               : press ctrl + c 
#                                     or 
#                                        docker stop mermaid-live-editor


FROM node:13.6.0-alpine as mermaid-live-editor-builder
COPY --chown=node:node . /home
WORKDIR /home
RUN yarn install
RUN yarn build

FROM httpd:2.4.41-alpine as mermaid-live-editor-runner
COPY --from=mermaid-live-editor-builder /home/docs /usr/local/apache2/htdocs
