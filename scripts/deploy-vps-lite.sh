#!/bin/bash
set -e

# DEVOPS-2 FIX: Extracted hardcoded IP to environment variable for multi-environment support
# Keeps backward compatibility with positional argument usage.
VPS_HOST=${VPS_HOST:-"${1:-100.111.74.69}"}
SSH_KEY="${2:-$HOME/.ssh/id_ed25519_b0yz4kr14}"
VPS_USER="tsi"
REMOTE_DIR="/home/tsi/OrthoPlus-Enterprise"

echo "[DEPLOY-LITE] Target VPS: $VPS_USER@$VPS_HOST"

# Ensure local builds exist
if [ ! -d "$(dirname $0)/../apps/web/dist" ]; then
  echo "[ERROR] Frontend dist not found. Run 'pnpm build' first."
  exit 1
fi
if [ ! -d "$(dirname $0)/../backend/dist" ]; then
  echo "[ERROR] Backend dist not found. Run 'pnpm --filter orthoplus-backend build' first."
  exit 1
fi

# Sync root workspace files
rsync -avz \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$(dirname $0)/../pnpm-lock.yaml" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"

rsync -avz \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$(dirname $0)/../pnpm-workspace.yaml" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"

# Sync backend production artifacts
rsync -avz --delete \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$(dirname $0)/../backend/dist/" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/backend/dist/"

rsync -avz --delete \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$(dirname $0)/../backend/prisma/" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/backend/prisma/"

rsync -avz \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$(dirname $0)/../backend/package.json" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/backend/"

# Sync frontend static files
rsync -avz --delete \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$(dirname $0)/../apps/web/dist/" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/apps/web/dist/"

# Sync nginx configs
rsync -avz \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$(dirname $0)/../nginx.conf" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"

# Remote setup
# DEVOPS-2 FIX: Generate secure random Redis password instead of using insecure hardcoded fallback.
# If REDIS_PASSWORD is not set locally, a strong random password is generated.
REDIS_PASSWORD="${REDIS_PASSWORD:-$(openssl rand -base64 32)}"

ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << REMOTE
  set -e
  cd "$REMOTE_DIR"

  # Install pnpm if missing
  if ! [ -f "\$HOME/.local/share/pnpm/pnpm" ]; then
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    ln -sf "\$HOME/.local/share/pnpm/.tools/pnpm-exe/"*/pnpm "\$HOME/.local/share/pnpm/pnpm"
  fi
  export PATH="\$HOME/.local/share/pnpm:\$PATH"

  # Install only backend production dependencies
  cd backend
  pnpm install --prod --frozen-lockfile
  npx prisma generate
  cd ..

  # Start Redis if not running
  if ! docker ps --format '{{.Names}}' | grep -q orthoplus-redis; then
    echo "[DEPLOY] Starting Redis..."
    docker run -d --name orthoplus-redis --restart always \
      -p 127.0.0.1:6379:6379 \
      -v redis-data:/data \
      redis:7-alpine \
      redis-server --requirepass "$REDIS_PASSWORD"
  fi

  # Nginx config
  sudo tee /etc/nginx/sites-available/orthoplus > /dev/null <<NGINX
server {
    listen 80;
    server_name _;
    root $REMOTE_DIR/apps/web/dist;
    index index.html;
    location / {
        try_files \$uri /index.html;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    location /health {
        proxy_pass http://127.0.0.1:3005/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

  sudo ln -sf /etc/nginx/sites-available/orthoplus /etc/nginx/sites-enabled/orthoplus
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx

  # Start backend
  pkill -f "node $REMOTE_DIR/backend/dist/index.js" 2>/dev/null || true
  cd backend && nohup node dist/index.js > ../backend.log 2>&1 &
  sleep 2
  curl -sf http://127.0.0.1:3005/health && echo "[DEPLOY] Backend health OK" || echo "[WARN] Backend health check failed"

  echo "[DEPLOY-LITE] Complete."
REMOTE
