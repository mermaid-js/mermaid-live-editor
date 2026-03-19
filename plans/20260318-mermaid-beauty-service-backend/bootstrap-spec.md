# Mermaid Beauty Service Phase 0 Bootstrap Spec

## Objective

Define the exact starter structure for `mermaid-beauty-service` as a standalone Go repository.

This spec is for Phase 0 only:

- initialize repo
- establish Docker and Compose conventions
- add API skeleton
- add Swagger baseline
- add test/lint/format baseline
- prepare the service for Phase 1 GIF MVP

## Repo Rules

- This backend is an independent Git repository.
- Local development must use `docker-compose.local.yml`.
- Deployment must use `docker-compose.yml`.
- Images must be built from `Dockerfile`.
- Swagger/OpenAPI is required from the start.
- Unit tests are required from the start.
- ESLint and Prettier are required for repo-level assets/config.
- Go-native linting and formatting are also required.
- Database migrations should use `golang-migrate`.
- Public endpoints should be protected by rate limiting, throttling, and concurrency control.

## Target Directory Layout

```text
mermaid-beauty-service/
├── cmd/
│   ├── api/
│   │   └── main.go
│   └── worker/
│       └── main.go
├── internal/
│   ├── app/
│   │   ├── api.go
│   │   └── worker.go
│   ├── config/
│   │   ├── config.go
│   │   └── config_test.go
│   ├── domain/
│   │   ├── render_job.go
│   │   └── artifact.go
│   ├── handler/
│   │   ├── health_handler.go
│   │   ├── gif_handler.go
│   │   └── middleware.go
│   ├── service/
│   │   ├── gif_service.go
│   │   └── health_service.go
│   ├── queue/
│   │   ├── queue.go
│   │   └── jobs.go
│   ├── throttling/
│   │   ├── rate_limit.go
│   │   ├── throttler.go
│   │   └── concurrency.go
│   ├── render/
│   │   ├── mermaid_renderer.go
│   │   ├── rasterizer.go
│   │   └── gif_encoder.go
│   ├── storage/
│   │   ├── storage.go
│   │   └── local_storage.go
│   ├── auth/
│   │   └── placeholder.go
│   └── platform/
│   │   ├── logger.go
│   │   ├── http.go
│   │   └── validator.go
├── pkg/
│   └── clients/
├── api/
│   └── openapi/
│       ├── openapi.yaml
│       └── swagger.md
├── migrations/
│   ├── 000001_init.up.sql
│   └── 000001_init.down.sql
├── deployments/
│   ├── docker/
│   │   └── Dockerfile.worker
│   └── compose/
│       └── example.env
├── scripts/
│   ├── swagger.sh
│   ├── lint.sh
│   └── test.sh
├── test/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── architecture.md
│   └── local-development.md
├── .gitignore
├── .editorconfig
├── .golangci.yml
├── .prettierrc
├── .prettierignore
├── eslint.config.js
├── Dockerfile
├── docker-compose.yml
├── docker-compose.local.yml
├── go.mod
├── go.sum
├── Makefile
├── package.json
├── README.md
└── .env.example
```

## Required Root Files

### `go.mod`

Purpose:

- initialize Go module
- pin Go version
- lock direct dependencies

Recommendation:

- Go `1.24.x` if your infra supports it, otherwise current stable team-approved version
- include `github.com/golang-migrate/migrate/v4` as the migration tool standard

### `Dockerfile`

Purpose:

- build API and worker images from a single source
- support both CI and deploy

Requirements:

- multi-stage build
- small runtime image
- separate targets for `api` and `worker` if needed
- non-root runtime user if possible

### `docker-compose.local.yml`

Purpose:

- local development entrypoint
- bring up API, worker, Redis, Postgres, MinIO or local object storage
- mount source and support iterative backend development

Expected services:

- `api`
- `worker`
- `redis`
- `postgres`
- `minio` or equivalent local object store

### `docker-compose.yml`

Purpose:

- deploy-oriented compose file
- no dev mounts
- production-like commands and restart policies

Expected behavior:

- builds from `Dockerfile`
- runs API and worker with stable service names
- uses env-based config

### `Makefile`

Required commands:

- `make up`
- `make down`
- `make logs`
- `make test`
- `make lint`
- `make format`
- `make swagger`
- `make build`
- `make migrate-up`
- `make migrate-down`
- `make migrate-create name=...`

Recommended command mapping:

```make
up:
	docker compose -f docker-compose.yml -f docker-compose.local.yml up
```

## Required Config Files

### `.env.example`

Must include at least:

- `APP_ENV`
- `APP_PORT`
- `LOG_LEVEL`
- `POSTGRES_DSN`
- `REDIS_ADDR`
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `GIF_JOB_TIMEOUT`
- `GIF_MAX_INPUT_BYTES`
- `RATE_LIMIT_RPS`
- `MIGRATIONS_DIR`

### `.golangci.yml`

Purpose:

- enforce Go code quality

Recommended enabled linters:

- `govet`
- `errcheck`
- `staticcheck`
- `ineffassign`
- `unused`
- `gosec`

## Required Migration Baseline

### Tool Choice

Use `golang-migrate` as the standard migration tool.

Reason:

- stable and common in Go services
- good PostgreSQL support
- works well in Docker and CI
- explicit SQL files are easy to review

### Migration File Convention

All migrations should use paired SQL files:

- `000001_init.up.sql`
- `000001_init.down.sql`
- `000002_render_jobs.up.sql`
- `000002_render_jobs.down.sql`

### Migration Commands

The repo should expose migration commands through `Makefile` and optionally scripts.

Recommended commands:

- `make migrate-up`
- `make migrate-down`
- `make migrate-create name=create_render_jobs`

### Docker and CI Expectation

- local migrations should run against services started from `docker-compose.local.yml`
- deploy jobs should run migrations against the deploy environment before or during rollout
- migration execution must not depend on host-installed tooling outside Docker unless explicitly documented

### `.prettierrc`

Purpose:

- format YAML, JSON, Markdown, OpenAPI, JS config

### `eslint.config.js`

Purpose:

- lint JS config and scripts only

Files it should cover:

- `eslint.config.js`
- `scripts/**/*.js`
- optional tooling config files

## Required API Baseline

### `cmd/api/main.go`

Responsibilities:

- load config
- initialize logger
- build HTTP server
- register routes
- start API process

### `cmd/worker/main.go`

Responsibilities:

- load config
- initialize queue consumer
- run render jobs

### `internal/handler/health_handler.go`

Required endpoints:

- `GET /healthz`
- `GET /readyz`

### `internal/handler/gif_handler.go`

Phase 0 scope:

- define request/response types
- stub handlers for future endpoints

Expected routes:

- `POST /v1/gif/render`
- `POST /v1/gif/jobs`
- `GET /v1/gif/jobs/{id}`
- `GET /v1/gif/jobs/{id}/download`

### `internal/throttling/*`

Responsibilities:

- rate limiting by IP
- throttling based on queue depth and worker pressure
- active job caps by IP
- active job caps globally

Recommended phase 1 defaults:

- `POST /v1/gif/render`: `5 requests/minute/IP`
- `POST /v1/gif/jobs`: `10 requests/minute/IP`
- `2-3` active jobs per IP
- global active-job cap driven by worker capacity
- queue threshold after which new jobs are rejected

## Required Swagger Baseline

### `api/openapi/openapi.yaml`

Must include:

- API title/version
- health endpoints
- placeholder GIF endpoints
- request/response schemas
- error schema

### `scripts/swagger.sh`

Purpose:

- validate or generate Swagger artifacts

Minimum expectation:

- one command to validate `openapi.yaml`

## Required Testing Baseline

### Unit Tests

At minimum create tests for:

- config loading
- handler validation behavior
- service-layer orchestration

Starter files:

- `internal/config/config_test.go`
- `internal/service/gif_service_test.go`
- `internal/handler/gif_handler_test.go`
- migration smoke validation can be added once the first tables exist

### Integration Test Folder

Create:

- `test/integration/`

This can be mostly empty at bootstrap, but should exist for queue/storage/database tests later.

Rate-limit and throttling tests should be added early once the first public endpoints exist.

## Required Quality Baseline

### Go

- `go test ./...`
- `golangci-lint run`
- `gofmt -w`
- `goimports -w`

### Repo-Level

- `prettier --check .`
- `eslint .`

Recommendation:

- install a tiny Node toolchain only for ESLint/Prettier if you insist on both
- keep that toolchain minimal and isolated to repo tooling

## Docker and Compose Expectations

### Local Compose

`docker-compose.local.yml` should provide:

- bind mounts for source code
- local env loading
- developer-friendly ports
- optional hot reload if adopted later
- Redis for rate limiting and queue/throttling state

### Deploy Compose

`docker-compose.yml` should provide:

- no bind mounts
- restart policies
- image build targets suitable for deploy
- stable env-driven configuration
- Redis included or connected as an external dependency for rate limiting and queue pressure checks

### Dockerfile Targets

Recommended targets:

- `base`
- `builder`
- `api`
- `worker`

## Minimum Phase 0 Deliverable

Phase 0 is complete when all of the following are true:

- repository exists independently
- `docker compose -f docker-compose.yml -f docker-compose.local.yml up` works
- API responds on `/healthz`
- worker process starts cleanly
- Swagger file exists and validates
- `make test` passes
- `make lint` passes
- `make format` is defined and works
- basic rate-limit and throttling wiring exists in the request path, even if thresholds are conservative

## Phase 0 Non-Goals

Do not build these yet:

- full GIF rendering pipeline
- authentication
- quotas
- billing
- team/workspace model
- full storage lifecycle

## Recommended Implementation Order

1. Create repo and root configs
2. Add `go.mod`, `Dockerfile`, compose files, and `Makefile`
3. Add API and worker entrypoints
4. Add config and health endpoints
5. Add Swagger skeleton
6. Add unit test baseline
7. Add lint/format baseline
8. Add queue/storage placeholders for Phase 1

## Open Decisions Before Bootstrap

- Which Go HTTP router do you want: `chi` or `gin`?
- Which queue library do you want: `asynq` or `river`?
- Which object storage do you want locally: `MinIO` or simple disk first?
- Do you want Swagger authored manually in OpenAPI YAML, or generated from Go annotations?
