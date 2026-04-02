#!/bin/bash
set -e

echo '🚀 OrthoPlus Production Deploy'
echo '=============================='

# Pull latest code
echo '📥 Pulling latest code...'
git pull origin main

# Install dependencies
echo '📦 Installing dependencies...'
npm ci

# Build application
echo '🔨 Building application...'
npm run build

# Database migrations
echo '🗄️  Running database migrations...'
cd backend
npx prisma migrate deploy || echo 'No migrations to run'
cd ..

# Reload PM2
echo '🔄 Reloading PM2...'
pm2 reload ecosystem.config.js --env production

# Health check
echo '✅ Health check...'
sleep 5
curl -f http://localhost:3000/health || exit 1

echo '🎉 Deployment complete!'
