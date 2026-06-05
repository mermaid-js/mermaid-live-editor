#!/usr/bin/env bash
# =============================================================================
# Mermaid Live Editor (Element Digital fork) — Update Script
# =============================================================================
# Run as root on the server:
#
#   bash /opt/mermaid-live-editor/update.sh
#
# Pulls the latest code, rebuilds the static editor + backend, applies any
# Prisma schema changes, and restarts the systemd service. The repo is private —
# git pull uses the SSH deploy key at /root/.ssh/mermaid_deploy. Run setup.sh
# first if the deploy key is not yet configured.
#
# Your server/.env is preserved across the update (it is backed up before the
# git reset and restored afterwards), so ADMIN_EMAILS, JWT_SECRET, DB password
# and Entra values survive.
# =============================================================================

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Must run as root ──────────────────────────────────────────────────────────
[[ $EUID -eq 0 ]] || error "Please run this script as root"

# ── Configuration ─────────────────────────────────────────────────────────────
INSTALL_DIR="${INSTALL_DIR:-/opt/mermaid-live-editor}"
SYSTEM_USER="${SYSTEM_USER:-mermaid}"
DEPLOY_KEY_FILE="/root/.ssh/mermaid_deploy"
REPO_SSH_URL="git@github.com:Element-Digital/mermaid-live-editor.git"
ENV_FILE="${INSTALL_DIR}/server/.env"

[[ -d "${INSTALL_DIR}/.git" ]] || error "Installation not found at ${INSTALL_DIR}. Run setup.sh first."

# ── Read UPDATE_BRANCH from server/.env (defaults to develop) ─────────────────
# setup.sh writes .env values unquoted (KEY=value), so accept optional quotes.
UPDATE_BRANCH="develop"
if [[ -f "${ENV_FILE}" ]]; then
  _br=$(grep -oP '^UPDATE_BRANCH=["'"'"']?\K[^"'"'"']+' "${ENV_FILE}" 2>/dev/null || true)
  [[ -n "${_br}" ]] && UPDATE_BRANCH="${_br}"
fi
info "Target branch: ${UPDATE_BRANCH}"

# ── Step 1: Verify SSH deploy key ─────────────────────────────────────────────
info "Checking SSH deploy key..."
[[ -f "${DEPLOY_KEY_FILE}" ]] || error "Deploy key not found at ${DEPLOY_KEY_FILE}. Run setup.sh first."

# Ensure SSH config routes github.com through the deploy key.
if ! grep -q "mermaid_deploy" /root/.ssh/config 2>/dev/null; then
  warn "SSH config missing — adding deploy key entry..."
  mkdir -p /root/.ssh && chmod 700 /root/.ssh
  cat >> /root/.ssh/config <<'SSHCONF'

Host github.com
  IdentityFile /root/.ssh/mermaid_deploy
  StrictHostKeyChecking accept-new
SSHCONF
  chmod 600 /root/.ssh/config
fi

# Switch remote to SSH if it was left as HTTPS.
CURRENT_REMOTE=$(git -C "${INSTALL_DIR}" remote get-url origin 2>/dev/null || echo "")
if [[ "${CURRENT_REMOTE}" == https://* ]]; then
  warn "Remote is HTTPS — switching to SSH..."
  git -C "${INSTALL_DIR}" remote set-url origin "${REPO_SSH_URL}"
fi

# ── Step 2: Pull latest code (preserving server/.env) ─────────────────────────
info "Pulling latest code..."
git config --global --add safe.directory "${INSTALL_DIR}" 2>/dev/null || true

# Preserve .env before discarding local modifications — user configuration
# (ADMIN_EMAILS, JWT_SECRET, DATABASE_URL, ENTRA_*, etc.) must survive resets.
ENV_BACKUP="/tmp/.mermaid_env_backup_$$"
[[ -f "${ENV_FILE}" ]] && cp "${ENV_FILE}" "${ENV_BACKUP}"

# Discard any local modifications to tracked files before pulling.
git -C "${INSTALL_DIR}" checkout -- .
git -C "${INSTALL_DIR}" fetch origin
git -C "${INSTALL_DIR}" checkout -B "${UPDATE_BRANCH}" "origin/${UPDATE_BRANCH}"
git -C "${INSTALL_DIR}" pull origin "${UPDATE_BRANCH}"

# Restore .env.
if [[ -f "${ENV_BACKUP}" ]]; then
  cp "${ENV_BACKUP}" "${ENV_FILE}"
  rm -f "${ENV_BACKUP}"
fi

COMMIT=$(git -C "${INSTALL_DIR}" rev-parse --short HEAD)
info "Now at commit: ${COMMIT}"

# ── Step 3: Enable pnpm via corepack ──────────────────────────────────────────
info "Ensuring pnpm via corepack..."
corepack enable

# ── Step 4: Build the static editor (root -> docs/) ───────────────────────────
info "Installing editor dependencies and rebuilding (this takes a few minutes)..."
cd "${INSTALL_DIR}"
corepack pnpm install --frozen-lockfile
corepack pnpm build

# ── Step 5: Install backend dependencies ──────────────────────────────────────
info "Installing backend dependencies..."
cd "${INSTALL_DIR}/server"
corepack pnpm install --frozen-lockfile

# ── Step 6: Apply Prisma schema changes ───────────────────────────────────────
# The backend runs via tsx (no compile step). Prisma needs DATABASE_URL, so
# source .env before invoking the CLI.
info "Generating Prisma client and pushing schema..."
set -a && source "${ENV_FILE}" && set +a
corepack pnpm exec prisma generate
corepack pnpm exec prisma db push

# ── Step 7: Fix ownership + permissions ───────────────────────────────────────
info "Fixing file ownership..."
chown -R "${SYSTEM_USER}:${SYSTEM_USER}" "${INSTALL_DIR}"
chmod 600 "${ENV_FILE}"

# ── Step 8: Restart service ───────────────────────────────────────────────────
info "Restarting mermaid service..."
systemctl restart mermaid
sleep 2

if systemctl is-active --quiet mermaid; then
  info "Service restarted successfully."
else
  error "Service failed to start. Check logs: journalctl -u mermaid -n 50"
fi

# ── Step 9: Health check ──────────────────────────────────────────────────────
HEALTH="$(curl -fsS "http://localhost:${PORT:-8787}/api/health" 2>/dev/null || echo 'unreachable')"

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Update Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  Commit:      ${COMMIT}"
echo "  Branch:      ${UPDATE_BRANCH}"
echo "  Updated at:  $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "  Status:      $(systemctl is-active mermaid)   (health: ${HEALTH})"
echo ""
echo "  View logs:  journalctl -u mermaid -f"
echo ""
