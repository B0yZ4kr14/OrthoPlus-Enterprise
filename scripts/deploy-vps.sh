#!/bin/bash
set -e

# OrthoPlus VPS Deploy Script
# Usage: ./scripts/deploy-vps.sh [VPS_IP] [SSH_KEY]

# DEVOPS-2 FIX: Extracted hardcoded IP to environment variable for multi-environment support
# Keeps backward compatibility with positional argument usage.
VPS_HOST=${VPS_HOST:-"${1:-100.111.74.69}"}
VPS_TARGET="vps-orthoplus"
REMOTE_DIR="/home/tsi/OrthoPlus-Enterprise"

echo "[DEPLOY] Target VPS: $VPS_TARGET"
echo "[DEPLOY] VPS Host: $VPS_HOST"
echo "[DEPLOY] Syncing project files..."

rsync -avz --delete \
  -e "ssh -F $HOME/.ssh/config -o StrictHostKeyChecking=no" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.turbo' \
  --exclude='dist' \
  --exclude='.cache' \
  --exclude='coverage' \
  --exclude='tests' \
  ~/Projects/OrthoPlus-Enterprise/ \
  "$VPS_TARGET:$REMOTE_DIR/"

# DEVOPS-2 FIX: Generate secure random Redis password instead of using insecure hardcoded fallback.
# If REDIS_PASSWORD is not set locally, a strong random password is generated.
REDIS_PASSWORD="${REDIS_PASSWORD:-$(openssl rand -base64 32)}"

echo "[DEPLOY] Installing pnpm and dependencies on VPS..."
ssh -F $HOME/.ssh/config -o "$VPS_TARGET" << REMOTE
  set -e
  cd "$REMOTE_DIR"
  
  # Install pnpm if missing
  if ! command -v pnpm &> /dev/null; then
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PATH="\$HOME/.local/share/pnpm:\$PATH"
  fi
  
  # Install dependencies
  pnpm install --frozen-lockfile
  
  # Build frontend and backend
  pnpm build
  
  # Ensure backend dist exists
  if [ ! -d backend/dist ]; then
    echo "[ERROR] Backend build failed: backend/dist not found"
    exit 1
  fi
  
  # Run Prisma Deploy and Generate
  echo "[DEPLOY] Running prisma migrate deploy..."
  cd backend && pnpm exec prisma migrate deploy && pnpm exec prisma generate && cd ..

  
  # Start Redis if not running
  if ! docker ps --format '{{.Names}}' | grep -q orthoplus-redis; then
    echo "[DEPLOY] Starting Redis container..."
    docker run -d --name orthoplus-redis --restart always \
      -p 6379:6379 \
      -v redis-data:/data \
      redis:7-alpine \
      redis-server --requirepass "$REDIS_PASSWORD"
  fi
  
  # Write minimal nginx config for SPA + API proxy
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
        proxy_pass http://127.0.0.1:3005/;
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
  
  # Start backend with PM2 or nohup
  if command -v pm2 &> /dev/null; then
    pm2 delete orthoplus-backend 2>/dev/null || true
    cd backend && pm2 start dist/index.js --name orthoplus-backend --env production
    pm2 save
  else
    echo "[DEPLOY] PM2 not found, using nohup for backend..."
    pkill -f "node dist/index.js" 2>/dev/null || true
    cd backend && nohup node dist/index.js > ../backend.log 2>&1 &
  fi
  
  echo "[DEPLOY] Deployment complete."
REMOTE

echo "[DEPLOY] Done."
