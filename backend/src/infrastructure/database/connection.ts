/**
 * Database Connection - Singleton instance
 *
 * Provides a shared PostgreSQL connection pool used by all repository
 * implementations across backend modules.
 */

import { PostgresDatabaseConnection } from './PostgresDatabaseConnection';

if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required but not set');
}

if (!process.env.DB_USER) {
  throw new Error('DB_USER environment variable is required but not set');
}

const db = new PostgresDatabaseConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'orthoplus',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  schema: process.env.DB_SCHEMA || 'public',
  ssl: process.env.DB_SSL === 'true',
});

export { db };
