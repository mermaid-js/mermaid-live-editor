#!/usr/bin/env bash
# =============================================================================
# Mermaid Live Editor (Element Digital fork) — Debian 13 Setup Script
# =============================================================================
# Static SvelteKit editor + Express/Prisma/PostgreSQL backend with Microsoft
# Entra ID (OIDC PKCE) login. The backend serves BOTH the editor and /api on a
# single port, so you can put it straight behind Nginx Proxy Manager with SSL.
#
# Download and run as root:
#
#   wget -O setup.sh https://raw.githubusercontent.com/Element-Digital/mermaid-live-editor/develop/setup.sh
#   bash setup.sh
#
# With configuration (recommended — Entra values are needed for login):
#
#   APP_DOMAIN=mermaid.yourdomain.com \
#   ENTRA_TENANT_ID=... ENTRA_CLIENT_ID=... ENTRA_CLIENT_SECRET=... \
#   NPM_IP=192.168.1.50 \
#   bash setup.sh
#
# To supply an existing deploy key (skips the interactive prompt):
#
#   DEPLOY_KEY=$(base64 -w0 < /path/to/id_ed25519) bash setup.sh
#
# All variables can be overridden via environment before calling the script.
# Re-running the script updates the install in place (git pull + rebuild).
# =============================================================================

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Must run as root ──────────────────────────────────────────────────────────
[[ $EUID -eq 0 ]] || error "Please run this script as root: bash setup.sh"

# ── Configuration — override via env vars before running ─────────────────────
REPO_URL="${REPO_URL:-git@github.com:Element-Digital/mermaid-live-editor.git}"
INSTALL_DIR="${INSTALL_DIR:-/opt/mermaid-live-editor}"
UPDATE_BRANCH="${UPDATE_BRANCH:-develop}"
SYSTEM_USER="${SYSTEM_USER:-mermaid}"

DB_NAME="${DB_NAME:-mermaid_editor}"
DB_USER="${DB_USER:-mermaid}"
DB_PASS="${DB_PASS:-$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 24)}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48)}"
SESSION_TTL_SECONDS="${SESSION_TTL_SECONDS:-3600}"

# Admin allowlist + MCP API access. ADMIN_EMAILS is a comma-separated allowlist
# for the Integrations page. MCP_API_TOKEN is the static Bearer token used by the
# MCP server (mcp/); MCP_API_EMAIL is the account it acts as (defaults to the
# first admin email).
ADMIN_EMAILS="${ADMIN_EMAILS:-}"
MCP_API_TOKEN="${MCP_API_TOKEN:-mle_pat_$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 43)}"
MCP_API_EMAIL="${MCP_API_EMAIL:-${ADMIN_EMAILS%%,*}}"

APP_PORT="${APP_PORT:-8787}"
APP_DOMAIN="${APP_DOMAIN:-}"     # e.g. "mermaid.yourdomain.com" — public URL via NPM
NPM_IP="${NPM_IP:-}"             # Nginx Proxy Manager LXC IP — firewall: allow APP_PORT from here only

# Microsoft Entra ID (Azure AD) app registration — required for login to work.
ENTRA_TENANT_ID="${ENTRA_TENANT_ID:-}"
ENTRA_CLIENT_ID="${ENTRA_CLIENT_ID:-}"
ENTRA_CLIENT_SECRET="${ENTRA_CLIENT_SECRET:-}"

# Derive public URLs. Falls back to http://<port> so the service still boots
# (editor works; login stays disabled until you fill in the real values).
if [[ -n "${APP_DOMAIN}" ]]; then
  APP_BASE_URL="https://${APP_DOMAIN}"
else
  APP_BASE_URL="http://localhost:${APP_PORT}"
  warn "APP_DOMAIN not set — using ${APP_BASE_URL}. Set APP_DOMAIN for real use."
fi
ENTRA_REDIRECT_URI="${ENTRA_REDIRECT_URI:-${APP_BASE_URL}/api/auth/callback}"

ENTRA_READY=true
if [[ -z "${ENTRA_TENANT_ID}" || -z "${ENTRA_CLIENT_ID}" || -z "${ENTRA_CLIENT_SECRET}" ]]; then
  ENTRA_READY=false
  ENTRA_TENANT_ID="${ENTRA_TENANT_ID:-REPLACE_ME}"
  ENTRA_CLIENT_ID="${ENTRA_CLIENT_ID:-REPLACE_ME}"
  ENTRA_CLIENT_SECRET="${ENTRA_CLIENT_SECRET:-REPLACE_ME}"
  warn "Entra ID values missing — writing placeholders. Login will not work until you"
  warn "edit ${INSTALL_DIR}/server/.env and run: systemctl restart mermaid"
fi

# ── Step 1: System update ─────────────────────────────────────────────────────
info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# ── Step 2: Base packages ─────────────────────────────────────────────────────
info "Installing base packages..."
apt-get install -y -qq git curl ca-certificates gnupg openssl ufw

# ── Step 3: SSH deploy key + clone/update repository ─────────────────────────
git config --global --add safe.directory "${INSTALL_DIR}" 2>/dev/null || true
DEPLOY_KEY_FILE="/root/.ssh/mermaid_deploy"

if [[ ! -f "${DEPLOY_KEY_FILE}" ]]; then
  mkdir -p /root/.ssh && chmod 700 /root/.ssh
  if [[ -n "${DEPLOY_KEY:-}" ]]; then
    info "Installing deploy key from DEPLOY_KEY env var..."
    echo "${DEPLOY_KEY}" | base64 -d > "${DEPLOY_KEY_FILE}"
    chmod 600 "${DEPLOY_KEY_FILE}"
  else
    info "Generating SSH deploy key..."
    ssh-keygen -t ed25519 -C "mermaid-deploy" -f "${DEPLOY_KEY_FILE}" -N ""
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  ACTION REQUIRED — Add deploy key${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    echo "  Go to: https://github.com/Element-Digital/mermaid-live-editor/settings/keys"
    echo "  Click: Add deploy key  (read-only is fine)"
    echo "  Title: $(hostname)"
    echo "  Key:"
    echo ""
    cat "${DEPLOY_KEY_FILE}.pub"
    echo ""
    read -rp "  Press Enter once you have added the key to GitHub..."
  fi
fi

if ! grep -q "mermaid_deploy" /root/.ssh/config 2>/dev/null; then
  cat >> /root/.ssh/config <<'SSHEOF'

Host github.com
  IdentityFile /root/.ssh/mermaid_deploy
  StrictHostKeyChecking accept-new
SSHEOF
  chmod 600 /root/.ssh/config
fi

if [[ -d "${INSTALL_DIR}/.git" ]]; then
  info "Repository exists at ${INSTALL_DIR} — updating to ${UPDATE_BRANCH}..."
  git -C "${INSTALL_DIR}" remote set-url origin "${REPO_URL}"
  git -C "${INSTALL_DIR}" fetch origin
  git -C "${INSTALL_DIR}" checkout -B "${UPDATE_BRANCH}" "origin/${UPDATE_BRANCH}"
else
  info "Cloning repository to ${INSTALL_DIR}..."
  git clone -b "${UPDATE_BRANCH}" "${REPO_URL}" "${INSTALL_DIR}"
fi

# ── Step 4: Node.js 20 (NodeSource) ───────────────────────────────────────────
info "Ensuring Node.js 20+..."
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
info "Node.js $(node -v)"

# ── Step 5: pnpm via corepack ─────────────────────────────────────────────────
info "Enabling pnpm via corepack..."
corepack enable
info "pnpm $(corepack pnpm --version 2>/dev/null || echo '(will resolve on first use)')"

# ── Step 6: PostgreSQL ────────────────────────────────────────────────────────
info "Installing PostgreSQL..."
if ! command -v psql &>/dev/null; then
  apt-get install -y -qq postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi
info "$(psql --version)"

# ── Step 7: Database + role (idempotent) ─────────────────────────────────────
info "Setting up database '${DB_NAME}' and role '${DB_USER}'..."
runuser -u postgres -- psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

# ── Step 8: System user ───────────────────────────────────────────────────────
if ! id -u "${SYSTEM_USER}" &>/dev/null; then
  info "Creating system user '${SYSTEM_USER}'..."
  useradd -r -s /bin/false "${SYSTEM_USER}"
fi

# ── Step 9: server/.env ───────────────────────────────────────────────────────
ENV_FILE="${INSTALL_DIR}/server/.env"
info "Writing ${ENV_FILE}..."
cat > "${ENV_FILE}" <<EOF
NODE_ENV=production
PORT=${APP_PORT}
APP_BASE_URL=${APP_BASE_URL}
POST_LOGIN_PATH=/edit
SERVE_FRONTEND=true
FRONTEND_DIR=${INSTALL_DIR}/docs

DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public

JWT_SECRET=${JWT_SECRET}
SESSION_TTL_SECONDS=${SESSION_TTL_SECONDS}

ENTRA_TENANT_ID=${ENTRA_TENANT_ID}
ENTRA_CLIENT_ID=${ENTRA_CLIENT_ID}
ENTRA_CLIENT_SECRET=${ENTRA_CLIENT_SECRET}
ENTRA_REDIRECT_URI=${ENTRA_REDIRECT_URI}

ADMIN_EMAILS=${ADMIN_EMAILS}
MCP_API_TOKEN=${MCP_API_TOKEN}
MCP_API_EMAIL=${MCP_API_EMAIL}
EOF
chmod 600 "${ENV_FILE}"

# ── Step 10: Build the editor (static -> docs/) ──────────────────────────────
info "Installing editor dependencies and building (this takes a few minutes)..."
cd "${INSTALL_DIR}"
corepack pnpm install --frozen-lockfile
corepack pnpm build

# ── Step 11: Backend deps + Prisma schema ────────────────────────────────────
info "Installing backend dependencies..."
cd "${INSTALL_DIR}/server"
corepack pnpm install --frozen-lockfile

info "Generating Prisma client and pushing schema..."
set -a && source "${ENV_FILE}" && set +a
corepack pnpm exec prisma generate
corepack pnpm exec prisma db push

# ── Step 12: Ownership + permissions ─────────────────────────────────────────
info "Setting ownership to '${SYSTEM_USER}'..."
chown -R "${SYSTEM_USER}:${SYSTEM_USER}" "${INSTALL_DIR}"
chmod 600 "${ENV_FILE}"

# ── Step 13: systemd service ──────────────────────────────────────────────────
info "Installing systemd service 'mermaid'..."
NODE_BIN="$(command -v node)"
cat > /etc/systemd/system/mermaid.service <<EOF
[Unit]
Description=Mermaid Live Editor (Element Digital)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=${SYSTEM_USER}
WorkingDirectory=${INSTALL_DIR}/server
ExecStart=${NODE_BIN} --import tsx src/index.ts
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=mermaid

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mermaid
systemctl restart mermaid
info "Service 'mermaid' enabled and started."

# ── Step 14: Firewall ─────────────────────────────────────────────────────────
info "Configuring ufw firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
if [[ -n "${NPM_IP}" ]]; then
  ufw allow from "${NPM_IP}" to any port "${APP_PORT}" proto tcp comment 'App port — NPM only'
  info "Firewall: port ${APP_PORT} allowed from NPM IP ${NPM_IP} only."
else
  warn "NPM_IP not set — allowing port ${APP_PORT} from all sources (not recommended)."
  ufw allow "${APP_PORT}/tcp" comment 'App port'
fi
ufw --force enable

# ── Step 15: Health check + summary ──────────────────────────────────────────
sleep 2
HEALTH="$(curl -fsS "http://localhost:${APP_PORT}/api/health" 2>/dev/null || echo 'unreachable')"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  Install dir:    ${INSTALL_DIR}"
echo "  App port:       ${APP_PORT}   (health: ${HEALTH})"
echo "  Database:       ${DB_NAME} (user ${DB_USER})"
echo "  DB password:    ${DB_PASS}"
echo "  Base URL:       ${APP_BASE_URL}"
echo "  Entra redirect: ${ENTRA_REDIRECT_URI}"
echo "  Secrets:        ${INSTALL_DIR}/server/.env  (chmod 600)"
echo ""
echo "  Next steps:"
echo "    1. In Nginx Proxy Manager: Proxy Host -> ${APP_PORT} (this LXC), enable SSL."
echo "    2. In the Entra app registration, add the redirect URI above (Web platform)."
if [[ "${ENTRA_READY}" != "true" ]]; then
  echo -e "    3. ${YELLOW}Fill ENTRA_* in ${INSTALL_DIR}/server/.env, then: systemctl restart mermaid${NC}"
fi
echo "    -> Browse to ${APP_BASE_URL} , click Save, sign in with Entra."
echo ""
echo "  Logs:    journalctl -u mermaid -f"
echo "  Update:  re-run this script (git pull + rebuild + restart)."
echo ""
