import { PrismaClient } from "@prisma/client";

/**
 * Global PrismaClient singleton.
 *
 * A single shared instance is used across the entire application to avoid
 * exhausting the PostgreSQL connection pool (default max_connections=100).
 * Instantiating PrismaClient per-request would open a new connection pool
 * for every HTTP call without closing the previous one.
 */
export const prisma = new PrismaClient();

// Gracefully disconnect from the database on process exit to avoid
// connection leaks and allow clean restarts.
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
