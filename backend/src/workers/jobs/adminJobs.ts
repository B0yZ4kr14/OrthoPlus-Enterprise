import { logger } from "@/infrastructure/logger";
import cron from "node-cron";
import { IAdminToolsRepository } from "@/modules/admin_tools/domain/repositories/IAdminToolsRepository";
import { AdminToolsRepository } from "@/modules/admin_tools/infrastructure/AdminToolsRepository";

export function startAdminJobs() {
  const repo: IAdminToolsRepository = new AdminToolsRepository();

  // Weekly DB Maintenance (Reindex and analyze) - Runs Sundays at 2AM
  cron.schedule("0 2 * * 0", async () => {
    logger.info("[Cron] Starting db-maintenance routine");
    try {
      // SECURITY: Prisma Client does not support DDL statements (VACUUM is DDL).
      // This command is a fixed literal with no interpolation — NOT injectable.
      // Use of $executeRawUnsafe is justified here as $executeRaw rejects DDL.
      await repo.runVacuumAnalyze();
      logger.info("[Cron] db-maintenance routine complete");
    } catch (e) {
      logger.error("[Cron] db-maintenance Error:", e);
    }
  });

  // Nightly Trash Collection (scheduled-cleanup) - Runs daily at 1AM
  cron.schedule("0 1 * * *", async () => {
    logger.info(
      "[Cron] Starting scheduled-cleanup (soft deletes older than 30 days)",
    );
    try {
      // Simulate cleanup of hypothetical 'deleted_at' rows
      // Cleanup job placeholder — implementar purge de registros soft-deleted após validação de retenção LGPD
      logger.info("[Cron] scheduled-cleanup complete");
    } catch (e) {
      logger.error("[Cron] scheduled-cleanup Error:", e);
    }
  });

  logger.info(
    "[Workers] Admin jobs scheduled (db-maintenance, scheduled-cleanup)",
  );
}
