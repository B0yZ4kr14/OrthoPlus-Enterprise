#!/bin/bash
set -e

# OrthoPlus Enterprise — VPS Health Check Script
# Feature 017: OMK Governance Integration
# Usage: ./scripts/vps-health-check.sh

VPS_HOST="${VPS_HOST:-100.111.74.69}"
VPS_USER="${VPS_USER:-tsi}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_b0yz4kr14}"
PUBLIC_URL="https://tsiapp.io/OrthoPlus-Enterprise/"
API_HEALTH="https://tsiapp.io/health"
WIKI_URL="https://tsiapp.io/OrthoPlus-Enterprise/WiKi"

echo "=========================================="
echo "OrthoPlus Enterprise — VPS Health Check"
echo "=========================================="
echo ""

PASS=0
FAIL=0

check() {
  local name="$1"
  local cmd="$2"
  echo -n "Checking $name... "
  if eval "$cmd" >/dev/null 2>&1; then
    echo "✅ PASS"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL"
    FAIL=$((FAIL + 1))
  fi
}

# External endpoint checks
check "Frontend (HTTPS 200)" "curl -sI '$PUBLIC_URL' | grep -q 'HTTP/.* 200'"
check "API Health (HTTPS 200)" "curl -sI '$API_HEALTH' | grep -q 'HTTP/.* 200'"
check "Wiki (HTTPS 200)" "curl -sI '$WIKI_URL' | grep -q 'HTTP/.* 200'"
check "SSL Certificate Valid" "curl -sI --max-time 10 '$PUBLIC_URL' | grep -q 'HTTP/.* 200'"

# SSH access check
check "SSH Access (Tailscale)" "ssh -i '$SSH_KEY' -o ConnectTimeout=5 -o BatchMode=yes '$VPS_USER@$VPS_HOST' 'echo ok'"

# PM2 process health check (backend runs via PM2, not Docker)
check "PM2: orthoplus-backend" "ssh -i '$SSH_KEY' -o ConnectTimeout=5 '$VPS_USER@$VPS_HOST' 'pm2 show orthoplus-backend | grep -q \"status.*online\"'"

# Nginx health check (frontend served by system nginx, not Docker)
check "Nginx: running" "ssh -i '$SSH_KEY' -o ConnectTimeout=5 '$VPS_USER@$VPS_HOST' 'systemctl is-active nginx | grep -q active'"

# Redis health check (runs as system service, not Docker)
check "Redis: ping" "ssh -i '$SSH_KEY' -o ConnectTimeout=5 '$VPS_USER@$VPS_HOST' 'redis-cli ping 2>/dev/null | grep -q PONG' || ssh -i '$SSH_KEY' -o ConnectTimeout=5 '$VPS_USER@$VPS_HOST' 'ss -tlnp | grep -q :6379'"

# Stale domain check
check "No stale domains" "! ssh -i '$SSH_KEY' -o ConnectTimeout=5 '$VPS_USER@$VPS_HOST' 'grep -r orthoplus.i9corp.com.br /home/$VPS_USER/OrthoPlus-Enterprise/ --include=*.ts --include=*.tsx --include=*.js --include=*.json --include=*.md --include=*.yml --include=*.yaml --include=*.sh 2>/dev/null | grep -v node_modules | grep -v .git/' | grep -q ."

echo ""
echo "=========================================="
echo "Results: $PASS passed, $FAIL failed"
echo "=========================================="

if [ $FAIL -gt 0 ]; then
  exit 1
fi
exit 0
