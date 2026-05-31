#!/bin/bash
# =============================================================================
# deploy-orthoplus-full.sh — Deploy Completo OrthoPlus Enterprise → VPS
# Inclui: frontend dist já buildado + backend build + rsync + PM2 reload
# USO: bash scripts/deploy-orthoplus-full.sh
# PRÉ-REQUISITO: SSH_KEY configurada via env var ou argumento
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[AVISO]${NC} $1"; }
log_error()   { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }

# DEVOPS-2 FIX: Extracted hardcoded IP to environment variable for multi-environment support
VPS_HOST=${VPS_HOST:-"${1}"}
VPS_USER="${VPS_USER:-tsi}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"

if [ -z "$VPS_HOST" ]; then
  log_error "VPS_HOST is required. Usage: $0 <VPS_HOST>"
fi
SSH_OPTS="-i $SSH_KEY -o ConnectTimeout=10"
REMOTE_BACKEND="/home/${VPS_USER}/OrthoPlus-Enterprise"
REMOTE_FRONTEND="${REMOTE_FRONTEND:-/var/www/orthoplus}"
LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        OrthoPlus Enterprise — Deploy VPS Completo        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# --- Validações ---
[ -f "$SSH_KEY" ] || log_error "Chave SSH não encontrada: $SSH_KEY"
log_success "Chave SSH: $SSH_KEY"

log_info "Testando conectividade com VPS..."
ssh $SSH_OPTS "$VPS_USER@$VPS_HOST" "echo CONNECTED" > /dev/null 2>&1 || log_error "Sem acesso ao VPS!"
log_success "VPS acessível: $VPS_HOST"

# --- [1/5] Build Frontend ---
log_info "[1/5] Build do frontend (Vite)..."
cd "$LOCAL_ROOT/apps/web"

VITE_REAL=$(readlink -f node_modules/vite 2>/dev/null || find "$LOCAL_ROOT/node_modules/.pnpm" -path "*/vite/bin/vite.js" | head -1 | xargs dirname | xargs dirname)
if [ -f "$VITE_REAL/bin/vite.js" ]; then
  node "$VITE_REAL/bin/vite.js" build
else
  log_warn "Vite não encontrado via readlink. Tentando path manual..."
  VITE_BIN=$(find "$LOCAL_ROOT/node_modules/.pnpm" -name "vite.js" -path "*/bin/vite.js" | head -1)
  node "$VITE_BIN" build
fi
log_success "Frontend buildado em apps/web/dist/"

# --- [2/5] Build Backend ---
log_info "[2/5] Build do backend (TypeScript)..."
cd "$LOCAL_ROOT"
pnpm --filter @orthoplus/shared-types run build
pnpm --filter orthoplus-backend run build
log_success "Backend buildado em backend/dist/"

# --- [3/5] Sync Frontend + Nginx para VPS ---
log_info "[3/5] Sincronizando frontend e nginx.conf para VPS..."
rsync -avz --delete \
  -e "ssh $SSH_OPTS" \
  "$LOCAL_ROOT/apps/web/dist/" \
  "$VPS_USER@$VPS_HOST:/tmp/orthoplus-frontend/"

# Sync corrected nginx.conf
rsync -avz -e "ssh $SSH_OPTS" \
  "$LOCAL_ROOT/nginx.conf" \
  "$VPS_USER@$VPS_HOST:/tmp/nginx-orthoplus.conf"

# Validate + reload nginx, then copy frontend
ssh $SSH_OPTS "$VPS_USER@$VPS_HOST" "
  sudo nginx -t -c /tmp/nginx-orthoplus.conf 2>&1 && \
  sudo cp /tmp/nginx-orthoplus.conf /etc/nginx/nginx.conf && \
  sudo systemctl reload nginx && echo 'nginx ✓ reloaded' || echo 'nginx config invalid — keeping current'
  sudo mkdir -p $REMOTE_FRONTEND
  sudo cp -r /tmp/orthoplus-frontend/. $REMOTE_FRONTEND/
  sudo chown -R www-data:www-data $REMOTE_FRONTEND
"
log_success "Frontend + nginx recarregado"

# --- [4/5] Sync Backend para VPS ---
log_info "[4/5] Sincronizando backend para VPS..."
rsync -avz --delete \
  -e "ssh $SSH_OPTS" \
  --exclude='node_modules' \
  --exclude='.turbo' \
  "$LOCAL_ROOT/backend/dist/" \
  "$VPS_USER@$VPS_HOST:$REMOTE_BACKEND/dist/"

rsync -avz \
  -e "ssh $SSH_OPTS" \
  "$LOCAL_ROOT/package.json" \
  "$LOCAL_ROOT/pnpm-lock.yaml" \
  "$LOCAL_ROOT/pnpm-workspace.yaml" \
  "$VPS_USER@$VPS_HOST:$REMOTE_BACKEND/../"

rsync -avz \
  -e "ssh $SSH_OPTS" \
  "$LOCAL_ROOT/shared-types/" \
  "$VPS_USER@$VPS_HOST:$REMOTE_BACKEND/../shared-types/"

rsync -avz \
  -e "ssh $SSH_OPTS" \
  "$LOCAL_ROOT/backend/package.json" \
  "$LOCAL_ROOT/backend/prisma/" \
  "$VPS_USER@$VPS_HOST:$REMOTE_BACKEND/"

log_success "Backend sincronizado para $REMOTE_BACKEND"

# --- [5/5] Migrations + PM2 Reload ---
log_info "[5/5] Aplicando migrações Prisma e recarregando PM2..."
ssh $SSH_OPTS "$VPS_USER@$VPS_HOST" << REMOTE
  set -e
  cd $REMOTE_BACKEND

  # Criar diretório de logs para PM2
  mkdir -p logs

  # Instalar/atualizar deps do backend (incluindo prisma para migrations)
  pnpm install --frozen-lockfile

  # Prisma migrate deploy
  echo "[VPS] Aplicando migrações Prisma..."
  # DEVOPS-2 FIX: Removed dangerous prisma db push --accept-data-loss fallback.
  # Using db push with --accept-data-loss can cause IRREVERSIBLE DATA LOSS in production.
  # Now the deploy aborts if migrations fail, requiring manual investigation.
  # Carregar .env e rodar migrations
  # Carregar .env.production se existir
  if [ -f .env.production ]; then
    set -a && source .env.production && set +a
  elif [ -f .env ]; then
    set -a && source .env && set +a
  else
    echo "⚠️  Nenhum arquivo .env ou .env.production encontrado!"
    exit 1
  fi

  # Rodar migrations e gerar Prisma client
  ./backend/node_modules/.bin/prisma migrate deploy --schema=backend/prisma/schema.prisma || { echo "Migration failed! Aborting deploy."; exit 1; }
  ./backend/node_modules/.bin/prisma generate --schema=backend/prisma/schema.prisma

  # PM2 reload
  if pm2 list | grep -q "orthoplus-backend"; then
    echo "[VPS] Recarregando PM2..."
    pm2 reload orthoplus-backend --update-env
  else
    echo "[VPS] Iniciando backend no PM2..."
    pm2 start backend/dist/index.js --name orthoplus-backend --env production
    pm2 save
  fi

  echo "[VPS] Status PM2:"
  pm2 status
REMOTE

log_success "Migrações aplicadas, PM2 recarregado"

# --- Health Check ---
log_info "Aguardando backend inicializar..."
sleep 5

# DEVOPS-2 FIX: Health check via porta 3005 diretamente (evita dependência do nginx Host header)
HEALTH=$(ssh $SSH_OPTS "$VPS_USER@$VPS_HOST" "curl -s http://127.0.0.1:3005/health" 2>/dev/null || echo "FAIL")
if echo "$HEALTH" | grep -qE '"status"|ok|healthy'; then
  log_success "Health check: OK — $HEALTH"
else
  log_warn "Health check não respondeu como esperado: $HEALTH"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║             DEPLOY CONCLUÍDO COM SUCESSO! 🎉              ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend: http://$VPS_HOST/                     ║${NC}"
echo -e "${GREEN}║  Health:   http://$VPS_HOST/health               ║${NC}"
echo -e "${GREEN}║  API:      http://$VPS_HOST/api/                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
