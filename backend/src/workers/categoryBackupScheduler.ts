import cron from "node-cron";
import { getCategoryBackupService } from "@/infrastructure/database/categoryClients";
import { logger } from "@/infrastructure/logger";

export function startCategoryBackupScheduler(): void {
  const jobs: Array<{ category: string; schedule: string }> = [
    { category: 'CORE',           schedule: '0 1 * * *'  },
    { category: 'FINANCEIRO',     schedule: '15 1 * * *' },
    { category: 'OPERACIONAL',    schedule: '30 1 * * *' },
    { category: 'COMERCIAL',      schedule: '45 1 * * *' },
    { category: 'CLINICO',        schedule: '0 2 * * *'  },
    { category: 'ADMINISTRATIVO', schedule: '15 2 * * *' },
  ];

  for (const { category, schedule } of jobs) {
    cron.schedule(schedule, async () => {
      try {
        const backup = getCategoryBackupService(category);
        const result = await backup.runBackup({ compress: true });
        logger.info(`[CategoryBackup] ${category} backup completed: ${result.filePath} (${result.sizeBytes} bytes)`);
      } catch (err: any) {
        logger.error(`[CategoryBackup] ${category} backup failed: ${err.message}`);
      }
    });
  }

  logger.info('Category backup scheduler started');
}
