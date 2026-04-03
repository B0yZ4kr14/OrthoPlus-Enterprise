#!/bin/bash
set -e

# OrthoPlus VPS Deploy Script
# Usage: ./scripts/deploy-vps.sh [VPS_IP] [SSH_KEY]

VPS_IP="${1:-100.111.74.69}"
SSH_KEY="${2:-$HOME/.ssh/id_ed25519_b0yz4kr14}"
VPS_USER="ubuntu"
PROJECT_DIR="OrthoPlus-Enterprise"
REMOTE_DIR="/home/ubuntu/$PROJECT_DIR"

echo "[DEPLOY] Target VPS: $VPS_USER@$VPS_IP"
echo "[DEPLOY] Syncing project files..."

rsync -avz --delete \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.turbo' \
  --exclude='dist' \
  --exclude='.cache' \
  --exclude='coverage' \
  --exclude='tests' \
  ~/Projects/OrthoPlus-Enterprise/ \
  "$VPS_USER@$VPS_IP:$REMOTE_DIR/"

echo "[DEPLOY] Installing pnpm and dependencies on VPS..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" << REMOTE
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
  
  # Start Redis if not running
  if ! docker ps --format '{{.Names}}' | grep -q orthoplus-redis; then
    echo "[DEPLOY] Starting Redis container..."
    docker run -d --name orthoplus-redis --restart always \
      -p 6379:6379 \
      -v redis-data:/data \
      redis:7-alpine \
      redis-server --requirepass \${REDIS_PASSWORD:-orthoplusredis2025}
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
        proxy_cache_bypass \$http_upgrade;
    }
    location /health {
        proxy_pass http://127.0.0.1:3005/health;
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
