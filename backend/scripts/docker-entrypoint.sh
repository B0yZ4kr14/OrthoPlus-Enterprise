#!/bin/sh
set -e

echo "[entrypoint] OrthoPlus Backend starting..."

# Wait for PostgreSQL to be ready (if DB_HOST is set)
if [ -n "$DB_HOST" ]; then
  echo "[entrypoint] Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
  until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "${DB_USER:-orthoplus}"; do
    echo "[entrypoint] PostgreSQL not ready yet, retrying in 2s..."
    sleep 2
  done
  echo "[entrypoint] PostgreSQL is ready."
fi

# Run Prisma seed if SEED_ADMIN_PASSWORD is set
if [ -n "$SEED_ADMIN_PASSWORD" ]; then
  echo "[entrypoint] Running Prisma seed..."
  npx prisma db seed || echo "[entrypoint] Seed completed (or skipped)."
fi

# Start the application
echo "[entrypoint] Starting Node.js application..."
exec node dist/index.js
