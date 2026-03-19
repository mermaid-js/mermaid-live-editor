# Mermaid Beauty Service Backend Plan

## Goal

Build a standalone Go backend in `mermaid-beauty-service` as a separate repository from the parent frontend project.

The backend roadmap is:

1. Phase 1: public GIF generation service
2. Phase 2: authentication and account-aware capabilities
3. Phase 3: additional platform features around rendering, jobs, storage, and billing

## Scope and Boundaries

- `mermaid-beauty-service` should be treated as its own backend product, not as a submodule of the parent frontend app.
- The initial release should optimize for one narrow responsibility: generate GIF output from Mermaid input reliably.
- The first production shape should remain public and stateless at the API layer, with rate limiting and job control instead of user auth.
- Auth should be deferred until the GIF service has stable rendering, queueing, storage, and observability.
- All environments should build and run through `Dockerfile` and `docker-compose`, rather than relying on ad hoc host-level runtime setup.
- Local development should use `docker-compose.local.yml`.
- Deployment should use `docker-compose.yml`.
- The repo baseline must include Swagger/OpenAPI, unit tests, ESLint, and Prettier.

## Product Direction

### Phase 1 Outcome

Expose a public API that accepts Mermaid diagram input and returns a generated GIF, either synchronously for small jobs or asynchronously for heavier jobs.

Primary use cases:

- Generate GIF previews from Mermaid code
- Generate animated diagram assets for sharing/demo purposes
- Provide a backend capability that the frontend can call later
- Support public access with abuse controls

### Phase 2 Outcome

Add identity and ownership so users can:

- persist generated assets
- manage history
- apply quotas by user/account
- unlock private/team features later

## Recommended Architecture

### Repo Strategy

Create a new independent Git repository for `mermaid-beauty-service`.

Containerization should be a first-class part of the repo from day one:

- `Dockerfile` for API/worker/runtime images
- `docker-compose.local.yml` for local orchestration
- `docker-compose.yml` for deploy orchestration
- optional compose overrides for staging only if genuinely needed later
- CI/CD should build and deploy using these container definitions, not separate handwritten shell setup

Quality and DX should also be first-class from day one:

- Swagger/OpenAPI spec checked into the repo
- unit test baseline for core services and handlers
- ESLint and Prettier configured for repo-level files and scripts
- generated docs and API contracts should be reproducible from commands/scripts

Recommended initial repo layout:

```text
mermaid-beauty-service/
├── cmd/
│   └── api/
├── internal/
│   ├── app/
│   ├── config/
│   ├── domain/
│   ├── handler/
│   ├── service/
│   ├── queue/
│   ├── render/
│   ├── storage/
│   └── auth/
├── pkg/
│   └── clients/
├── migrations/
├── deployments/
│   ├── docker/
│   └── compose/
├── api/
│   └── openapi/
├── scripts/
├── test/
└── docs/
```

Recommended root-level tooling/config files:

```text
mermaid-beauty-service/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.local.yml
├── .golangci.yml
├── .prettierrc
├── eslint.config.js
├── Makefile
└── package.json
```

### Runtime Components

Recommended v1 components:

- `api`: HTTP server in Go
- `worker`: background job processor in Go
- `redis`: queue, rate limiting, short-lived job state
- `postgres`: job metadata, audit data, later auth/account data
- `object storage`: S3-compatible storage for generated GIF files
- `renderer runtime`: headless browser or rendering engine wrapper for Mermaid-to-frame generation

These components should be designed to run together in Docker Compose for local development and in containerized deployment environments for staging/production.

### Suggested Go Stack

- HTTP framework: `chi` or `gin`
- Config: `envconfig`, `koanf`, or `viper`
- Validation: `go-playground/validator`
- Logging: `zap` or `zerolog`
- Metrics: Prometheus
- Tracing: OpenTelemetry
- Database: PostgreSQL with `sqlc` or `pgx`
- Migrations: `golang-migrate`
- Queue: Redis with `asynq` or `river`
- Auth later: JWT/session layer, preferably simple middleware first

### Tooling Baseline

Because you explicitly want Swagger, unit tests, ESLint, and Prettier, the repo should define a mixed toolchain clearly:

- unit tests: `go test ./...`
- Swagger/OpenAPI: source-of-truth spec under `api/openapi`
- ESLint: apply to JS config/scripts if present
- Prettier: apply to Markdown, YAML, JSON, OpenAPI, and JS config files

Recommendation:

- keep ESLint and Prettier for repo-level config/docs consistency
- also add Go-native quality tools for source code: `golangci-lint`, `gofmt`, and `goimports`
- do not rely on ESLint and Prettier as the only quality gate for Go source
- use `golang-migrate` for schema changes, with SQL files committed under `migrations/`

## GIF Service Design

### Core Technical Problem

Mermaid does not natively output animated GIFs. The backend must define what a "GIF" means.

You need to choose one of these product definitions early:

1. Single-frame GIF converted from rendered SVG/PNG
2. Multi-frame animated GIF from scripted transitions
3. Build-up GIF that reveals nodes/edges step by step

Recommended v1:

- start with single-frame GIF support
- keep the rendering pipeline extensible so animated GIF can be introduced later

This avoids shipping a misleadingly complex first version.

### Rendering Pipeline

Recommended v1 pipeline:

1. Receive Mermaid source and render options
2. Render Mermaid to SVG using a controlled renderer
3. Convert SVG to raster image
4. Encode raster output to GIF
5. Save output to object storage or temporary file store
6. Return direct download URL or binary response

Recommended v1.5 pipeline for async jobs:

1. API validates request
2. API enqueues render job
3. Worker renders SVG
4. Worker rasterizes and encodes GIF
5. Worker uploads artifact
6. API exposes job status and artifact URL

### API Shape

Recommended initial endpoints:

- `POST /v1/gif/render`
- `POST /v1/gif/jobs`
- `GET /v1/gif/jobs/{id}`
- `GET /v1/gif/jobs/{id}/download`
- `GET /healthz`
- `GET /readyz`

Recommended request fields:

- `code`
- `theme`
- `background`
- `width`
- `height`
- `scale`
- `output_mode`
- `ttl`

Recommended response models:

- sync: file or signed URL
- async: job id, status, created_at, expires_at, download_url

## Public Access Controls

Because phase 1 is public, abuse protection is mandatory.

### Minimum Controls for v1

- IP-based rate limiting
- system throttling when queue depth or worker pressure is too high
- per-IP active job caps
- global active job caps
- request size limits
- render timeout limits
- concurrency caps
- payload validation
- job TTL and automatic cleanup
- content-type restrictions
- optional CAPTCHA or proof-of-work only if abuse appears

### Operational Safeguards

- isolate rendering from API process
- cap CPU and memory per job
- sandbox headless rendering
- reject oversized diagrams
- store generated files with expiration

### Traffic Protection Model

Phase 1 should explicitly separate three mechanisms:

1. `rate limiting`: restrict request frequency by IP
2. `throttling`: reject or slow requests when the system is overloaded
3. `concurrency control`: cap active render jobs per IP and globally

Recommended phase 1 defaults:

- `POST /v1/gif/render`: `5 requests/minute/IP`
- `POST /v1/gif/jobs`: `10 requests/minute/IP`
- per-IP active jobs: `2-3`
- global active jobs: small fixed cap based on worker capacity
- queue depth threshold: reject new jobs once the waiting queue passes a configured limit

Recommended response behavior:

- `429 Too Many Requests` for IP-based rate-limit violations
- `429 Too Many Requests` or `503 Service Unavailable` for throttling, depending on whether you want to treat overload as quota or service pressure
- structured error payloads with retry guidance where possible

Implementation recommendation:

- Redis for rate-limit counters
- Redis or queue backend as the source of queue-depth/throttling signals
- worker/job store for active-job counting

## Authentication Roadmap

Auth should not be phase 1. It should arrive after the service proves useful and stable.

### Phase 2 Auth Goals

- user registration/login
- API key support for programmatic usage
- per-user quotas
- job ownership
- persisted artifact history
- admin controls

### Suggested Auth Model

Recommended order:

1. internal admin access and service API keys
2. user auth with JWT or session
3. team/workspace model

Avoid introducing OAuth, RBAC, billing, and organizations in the first auth iteration unless product demand is already clear.

## Data Model Evolution

### Phase 1 Tables

- `render_jobs`
- `render_artifacts`
- `rate_limit_events` or Redis-only implementation

Migration convention:

- `migrations/000001_init.up.sql`
- `migrations/000001_init.down.sql`
- `migrations/000002_render_jobs.up.sql`
- `migrations/000002_render_jobs.down.sql`

### Phase 2 Tables

- `users`
- `api_keys`
- `sessions`
- `user_quotas`
- `job_ownership`

### Phase 3 Tables

- `workspaces`
- `workspace_members`
- `plans`
- `usage_events`

## Delivery Phases

### Phase 0: Repo Bootstrap

Goal: create a clean standalone backend repo.

Tasks:

- initialize separate Git repository
- set up Go module
- set up Makefile/task runner
- add `Dockerfile` for the Go service runtime
- add `docker-compose.local.yml` for local backend stack
- add `docker-compose.yml` for deploy stack
- define how API, worker, Redis, Postgres, and storage run together through Compose
- add lint, test, and CI baseline
- define config contract
- add Swagger/OpenAPI skeleton
- add ESLint and Prettier config for repo-level files
- add Go-native lint/format commands alongside those repo-level tools

Recommended bootstrap commands:

- `make up` -> `docker compose -f docker-compose.yml -f docker-compose.local.yml up`
- `make down`
- `make test`
- `make lint`
- `make format`
- `make swagger`

Exit criteria:

- service starts locally
- health endpoints work
- CI passes
- Swagger is generated or validated successfully
- unit tests run in CI
- lint and format checks run in CI

### Phase 1: Public GIF MVP

Goal: deliver first usable public rendering service.

Tasks:

- define v1 API contract
- implement Mermaid render pipeline
- convert output to GIF
- support sync rendering for simple cases
- add async job mode for heavy rendering
- add Redis-backed queue
- add temporary object storage
- add rate limiting and request validation
- add throttling based on queue depth and worker pressure
- add per-IP and global concurrency caps
- add structured logs and metrics
- add Swagger docs for all public endpoints
- add unit tests for handlers, validation, and render/job orchestration

Exit criteria:

- can submit Mermaid code and receive GIF output
- service survives malformed and oversized requests
- queue/worker recovery is acceptable

### Phase 1.5: Production Hardening

Goal: make the public GIF service operable.

Tasks:

- add retries and dead-letter strategy
- add job cleanup and storage TTL cleanup
- add dashboard metrics
- add alerting
- document SLOs and limits
- add load tests
- add abuse monitoring

Exit criteria:

- deployment is reproducible
- operational runbook exists
- p95 latency and failure rate are visible

### Phase 2: Auth and Ownership

Goal: introduce users without destabilizing render flow.

Tasks:

- add user model
- add API keys
- add protected endpoints
- attach jobs/artifacts to owners
- add quota enforcement
- add simple admin tooling

Exit criteria:

- authenticated users can manage their own jobs
- public mode can be reduced or retained behind quotas

### Phase 3: Platform Features

Potential follow-ups:

- animated build-up GIFs
- PNG/SVG/WebP export APIs
- saved templates
- asset gallery
- workspace/team support
- billing and plans
- webhook/callback completion

## Deployment Recommendation

Recommended first production topology:

- API container
- worker container
- Redis
- PostgreSQL
- S3-compatible bucket
- reverse proxy

Deployment environments:

- local via Docker Compose
- staging via Docker Compose or compose-compatible deployment target
- production via Docker Compose initially, with room to move later to a container platform if scale requires it

Recommended deployment principle:

- local startup should use `docker-compose.local.yml`
- CI validation should build from `Dockerfile`
- deployment jobs should use `docker-compose.yml`
- local and deploy should share the same `Dockerfile` images to minimize config drift

## Verification Strategy

### Engineering Checks

- unit tests for validation and job orchestration
- integration tests for queue, storage, and database
- render golden tests for known Mermaid inputs
- load tests for public endpoints
- smoke tests in CI
- Swagger validation in CI
- ESLint and Prettier checks for repo-level assets/config
- Go lint/format checks for backend source
- verify rate-limit, throttling, and concurrency protection under test scenarios

### Product Checks

- correct GIF output for representative diagrams
- stable output size and acceptable latency
- clear error responses for invalid Mermaid code

## Risks

### Technical Risks

- Mermaid rendering may require browser-level compatibility work
- GIF generation can be CPU-heavy
- public endpoints can be abused quickly
- rendering consistency may vary across runtime environments

### Product Risks

- GIF may be requested, but PNG/SVG may actually satisfy most users
- auth may be introduced too early and slow down core rendering work
- async jobs may become necessary earlier than expected

## Recommended Immediate Next Steps

1. Confirm the exact product definition of "GIF" for v1: single-frame or animated.
2. Split `mermaid-beauty-service` into its own Git repository immediately.
3. Bootstrap the Go service with API, worker, Redis, PostgreSQL, and object storage scaffolding.
4. Implement one narrow vertical slice: `POST /v1/gif/render` for public single-frame GIF generation.
5. Add basic rate limiting, timeout control, and observability before any auth work.

## Open Questions

- Is v1 GIF intended to be single-frame or animated?
- Should output be returned directly or always via stored artifact URL?
- Will the frontend call this service server-to-server or directly from browser?
- Do you want public anonymous usage permanently, or only as a temporary phase?
- Which storage target should be used first: local disk, MinIO, S3, or Cloudflare R2?
