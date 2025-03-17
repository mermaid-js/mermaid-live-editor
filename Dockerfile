FROM docker.io/library/node:20-alpine3.18 AS mermaid-live-editor-dependencies

RUN apk --no-cache add build-base git python3 && \
    rm -rf /var/cache/apk/*

RUN npm install -g pnpm

WORKDIR /app

COPY ./package.json .
COPY ./pnpm-lock.yaml .

RUN pnpm install

FROM mermaid-live-editor-dependencies AS mermaid-live-editor-builder

ARG MERMAID_RENDERER_URL
ARG MERMAID_KROKI_RENDERER_URL
ARG MERMAID_ANALYTICS_URL
ARG MERMAID_DOMAIN
ARG MERMAID_IS_ENABLED_MERMAID_CHART_LINKS

COPY . ./

RUN pnpm build

FROM mermaid-live-editor-builder AS mermaid-dev

ENTRYPOINT ["pnpm", "dev"]

FROM nginx:1.25-alpine3.18 AS mermaid

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=mermaid-live-editor-builder /app/docs /usr/share/nginx/html
