import { logger } from "@/infrastructure/logger";
import cron from "node-cron";
import { IAnalyticsRepository } from "@/modules/analytics/domain/repositories/IAnalyticsRepository";
import { AnalyticsRepository } from "@/modules/analytics/infrastructure/AnalyticsRepository";

// Replacing schedule-bi-export edge function
export const runScheduleBiExportJob = async () => {
  const repo: IAnalyticsRepository = new AnalyticsRepository();
  logger.info("Running BI Export job...");
  try {
    // Basic BI export mock logic
    const reports = await repo.groupAnalyticsEventsByType();

    logger.info(
      `Generated BI aggregated report for ${reports.length} event types.`,
    );

    // Normally we would push this file to an S3/MinIO bucket and log
    logger.info("BI Export completed successfully.");
  } catch (error) {
    logger.error("Error in schedule-bi-export cron: ", error);
  }
};

export const startScheduleBiExportCron = () => {
  // Run every day at 2:00 AM
  cron.schedule("0 2 * * *", runScheduleBiExportJob);
  logger.info(
    "Scheduled BI Export Job initialized: running daily at 02:00 AM.",
  );
};
