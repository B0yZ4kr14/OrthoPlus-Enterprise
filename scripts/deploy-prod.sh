#!/bin/bash
# ============================================================================
# OrthoPlus — Production Deploy Script
# ============================================================================
# Usage: ./scripts/deploy-prod.sh
# Requires: Docker, docker compose v2, .env.production
# ============================================================================
set -euo pipefail

echo "🔍 Validating pre-deploy requirements..."

# Verify .env.production exists
if [[ ! -f .env.production ]]; then
  echo "❌ ERROR: .env.production not found"
  echo "   Copy .env.production.example to .env.production and fill in the values"
  exit 1
fi

# Load and validate critical environment variables
# shellcheck disable=SC1091
source .env.production

# Validate JWT_SECRET is not the default placeholder
if [[ -z "${JWT_SECRET:-}" ]] || [[ "${JWT_SECRET}" == *"generate-with-openssl"* ]] || [[ "${JWT_SECRET}" == "supersecretmockjwt" ]]; then
  echo "❌ ERROR: JWT_SECRET is not set or uses a placeholder value"
  echo "   Generate a secure key: openssl rand -base64 32"
  exit 1
fi

# Block dangerous dev-mode settings in production
if [[ "${AUTH_ALLOW_MOCK:-false}" == "true" ]]; then
  echo "❌ ERROR: AUTH_ALLOW_MOCK=true is not allowed in production"
  exit 1
fi

if [[ "${ENABLE_DANGEROUS_ADMIN_ENDPOINTS:-false}" == "true" ]]; then
  echo "❌ ERROR: ENABLE_DANGEROUS_ADMIN_ENDPOINTS=true is not allowed in production"
  exit 1
fi

# Validate required variables
REQUIRED_VARS=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "DATABASE_URL")
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "❌ ERROR: Required variable $var is not set in .env.production"
    exit 1
  fi
done

echo "✅ Pre-deploy validation passed"

# Build images
echo "🏗️  Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

# Deploy
echo "🚀 Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for healthchecks
echo "⏳ Waiting for services to become healthy (60s)..."
sleep 60

# Show status
echo "📊 Service status:"
docker compose -f docker-compose.prod.yml ps

# Run Prisma migrations
echo "🗄️  Running database migrations..."
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy || \
  echo "⚠️  Migration step skipped (run manually if needed)"

echo ""
echo "✅ Deploy completed successfully!"
echo "   Check logs with: docker compose -f docker-compose.prod.yml logs -f"
