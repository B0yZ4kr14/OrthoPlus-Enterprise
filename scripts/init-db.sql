-- Initial database setup for OrthoPlus Enterprise
-- This script runs on first PostgreSQL container startup

-- Create application user (if not using superuser)
-- CREATE USER orthoplus WITH PASSWORD '${DB_PASSWORD}';
-- GRANT ALL PRIVILEGES ON DATABASE orthoplus TO orthoplus;

-- Note: Schema creation is handled by Prisma migrations
-- This file exists to satisfy docker-compose volume mounts
