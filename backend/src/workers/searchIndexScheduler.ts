import cron from "node-cron";
import { logger } from "@/infrastructure/logger";
import { prisma } from "@/infrastructure/database/prismaClient";
import { PacienteIndexer } from "@/modules/search_index/services/PacienteIndexer";
import { AgendaIndexer } from "@/modules/search_index/services/AgendaIndexer";
import { PepIndexer } from "@/modules/search_index/services/PepIndexer";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

interface IndexerJob {
  name: string;
  run: (since: Date) => Promise<{ indexed: number; durationMs: number }>;
}

export function startSearchIndexScheduler(): void {
  const enabled = process.env.SEARCH_INDEX_CRON_ENABLED !== "false";
  if (!enabled) {
    logger.info(
      "[SearchIndexScheduler] Cron desabilitado via SEARCH_INDEX_CRON_ENABLED",
    );
    return;
  }

  const pacienteIndexer = new PacienteIndexer(prisma);
  const agendaIndexer = new AgendaIndexer(prisma);
  const pepIndexer = new PepIndexer(prisma);

  const jobs: IndexerJob[] = [
    {
      name: "pacientes",
      run: (since) => pacienteIndexer.incremental(since),
    },
    {
      name: "agenda",
      run: (since) => agendaIndexer.incremental(since),
    },
    {
      name: "pep",
      run: (since) => pepIndexer.incremental(since),
    },
  ];

  cron.schedule("0 */6 * * *", async () => {
    const since = new Date(Date.now() - SIX_HOURS_MS);
    logger.info(
      `[SearchIndexScheduler] Iniciando reindexacao incremental desde ${since.toISOString()}`,
    );

    for (const job of jobs) {
      try {
        const result = await job.run(since);
        logger.info(
          `[SearchIndexScheduler] ${job.name} reindexados: ${result.indexed} em ${result.durationMs}ms`,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(
          `[SearchIndexScheduler] Falha na reindexacao de ${job.name}: ${message}`,
        );
      }
    }

    logger.info(
      "[SearchIndexScheduler] Ciclo de reindexacao incremental concluido",
    );
  });

  logger.info("[SearchIndexScheduler] Agendador iniciado (a cada 6 horas)");
}
