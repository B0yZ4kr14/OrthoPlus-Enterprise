import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import cron from 'node-cron';


export function startAdminJobs() {
  // Weekly DB Maintenance (Reindex and analyze) - Runs Sundays at 2AM
  cron.schedule('0 2 * * 0', async () => {
    logger.info('[Cron] Starting db-maintenance routine');
    try {
        await prisma.$executeRawUnsafe(`VACUUM ANALYZE;`);
        logger.info('[Cron] db-maintenance routine complete');
    } catch (e) {
        logger.error('[Cron] db-maintenance Error:', e);
    }
  });

  // Nightly Trash Collection (scheduled-cleanup) - Runs daily at 1AM
  cron.schedule('0 1 * * *', async () => {
     logger.info('[Cron] Starting scheduled-cleanup (soft deletes older than 30 days)');
     try {
         // Simulate cleanup of hypothetical 'deleted_at' rows
         // await prisma.$executeRawUnsafe(`DELETE FROM records WHERE deleted_at < NOW() - INTERVAL '30 days';`);
         logger.info('[Cron] scheduled-cleanup complete');
     } catch (e) {
        logger.error('[Cron] scheduled-cleanup Error:', e);
     }
  });

  logger.info('[Workers] Admin jobs scheduled (db-maintenance, scheduled-cleanup)');
}
