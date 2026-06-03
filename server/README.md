# Mermaid Live Editor — Backend API

Express 5 + Prisma + PostgreSQL service that adds **per-user diagram storage with
folders**, authenticated with **Microsoft Entra ID** (OIDC PKCE) and a JWT
httpOnly session cookie.

The editor stays a static SvelteKit app; in production it is served behind a
reverse proxy that forwards `/api/*` to this service (same origin), so the session
cookie is first-party and no CORS is needed.

## Endpoints

| Method | Path                      | Auth | Purpose                                          |
| ------ | ------------------------- | ---- | ------------------------------------------------ |
| GET    | `/api/health`             | –    | Liveness probe                                   |
| GET    | `/api/auth/login`         | –    | Start Entra PKCE login (redirects to Microsoft)  |
| GET    | `/api/auth/callback`      | –    | OAuth redirect target; sets session cookie       |
| POST   | `/api/auth/logout`        | ✅   | Clear session                                    |
| GET    | `/api/auth/me`            | ✅   | Current user `{ id, email, displayName }`        |
| GET    | `/api/folders`            | ✅   | List folders (flat; client builds the tree)      |
| POST   | `/api/folders`            | ✅   | Create `{ name, parentId? }`                     |
| PATCH  | `/api/folders/:id`        | ✅   | Rename / move `{ name?, parentId? }`             |
| DELETE | `/api/folders/:id`        | ✅   | Delete (cascades to children + diagrams' folder) |
| GET    | `/api/diagrams?folderId=` | ✅   | List diagram metadata (no payload)               |
| GET    | `/api/diagrams/:id`       | ✅   | Full diagram incl. `payload`                     |
| POST   | `/api/diagrams`           | ✅   | Create `{ name, folderId?, payload }`            |
| PATCH  | `/api/diagrams/:id`       | ✅   | Update `{ name?, folderId?, payload? }`          |
| DELETE | `/api/diagrams/:id`       | ✅   | Delete                                           |

`payload` is the pako-serialized editor `State` (from `serializeState()` in the
editor). Every row is owned by the authenticated user; ownership is enforced in
middleware (filtered by `userId`).

## Setup

```bash
cd server
cp .env.example .env          # fill in DATABASE_URL + Entra values + JWT_SECRET
pnpm install                  # or npm install
pnpm prisma:generate
pnpm prisma:migrate           # creates tables on your dev Postgres
pnpm dev                      # http://localhost:8787
```

### Entra ID app registration

1. Azure Portal → **Entra ID → App registrations → New registration**.
2. Add a **Web** redirect URI matching `ENTRA_REDIRECT_URI`
   (e.g. `http://localhost:8787/api/auth/callback`, and your prod URL).
3. **Certificates & secrets →** create a client secret → `ENTRA_CLIENT_SECRET`.
4. Copy the **Application (client) ID** → `ENTRA_CLIENT_ID` and the
   **Directory (tenant) ID** → `ENTRA_TENANT_ID`.

### Production (single port)

Set `SERVE_FRONTEND=true` and this process also serves the built static editor
(`docs/`, override with `FRONTEND_DIR`) on the same port as `/api`. That means one
process behind a single reverse proxy / Nginx Proxy Manager host with TLS — no
separate static web server needed. The repo-root `setup.sh` automates the whole
Debian install this way.

### Local dev with the editor

Run this service on `:8787` and the editor (`pnpm dev`, `:3000`). The editor's
Vite dev proxy forwards `/api` → `:8787`, so the browser only ever talks to one
origin. See the repo root for the proxy config.

## Tests

```bash
pnpm test          # unit tests: validation, JWT, PKCE helpers (no DB needed)
```

Full request/ownership integration tests require a throwaway Postgres
(`prisma migrate deploy` against a test DB) and can mock the Entra token
exchange — left as a follow-up.

## Notes / hardening backlog

- The `id_token` is trusted because it is fetched server-to-server over TLS with
  the confidential client secret; add JWKS signature validation for defence in depth.
- TOTP, IP allowlisting and AES-256-GCM field encryption from the org stack are
  not wired up yet — `requireAuth` is the natural place to add them.
- Session cookie is `SameSite=Lax` so the Entra callback redirect carries it;
  `Secure` is enabled automatically when `NODE_ENV=production`.
