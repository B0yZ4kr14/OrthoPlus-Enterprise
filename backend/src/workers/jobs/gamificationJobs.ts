import { logger } from "@/infrastructure/logger";
import cron from "node-cron";
import { IAnalyticsRepository } from "@/modules/analytics/domain/repositories/IAnalyticsRepository";
import { AnalyticsRepository } from "@/modules/analytics/infrastructure/AnalyticsRepository";

/** Upper bound on how many active goals are processed per run to avoid OOM. */
const MAX_ACTIVE_GOALS_BATCH_SIZE = 10_000;

export function startGamificationJobs() {
  // Executar diariamente às 23:30 para processamento noturno de metas de gamificação
  cron.schedule("30 23 * * *", async () => {
    logger.info("[Cron] Starting processar-metas-gamificacao job");
    await runGamificationMetricsJob();
  });
  logger.info("[Workers] Gamification jobs scheduled");
}

export async function runGamificationMetricsJob() {
  const repo: IAnalyticsRepository = new AnalyticsRepository();
  try {
    logger.info("[Gamificação] Iniciando processamento de metas e rankings");

    const startMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    // Fetch ALL active goals across ALL clinics in a single query instead of
    // one query per clinic (eliminates the N+1 clinic-loop pattern).
    const metas = await repo.findAllActiveGamificationGoals(
      MAX_ACTIVE_GOALS_BATCH_SIZE,
    );

    logger.info(`[Gamificação] Processando ${metas.length} meta(s) ativas`);

    // Collect all unique dentist IDs (stored in user_id) from CONSULTAS_MES
    // goals so we can batch the appointment counts in a single GROUP BY query
    // instead of one COUNT query per goal (eliminates the inner N+1 pattern).
    const consultasMesGoals = metas.filter(
      (m: unknown) => (m as Record<string, unknown>).type === "CONSULTAS_MES",
    );
    const dentistIds = [
      ...new Set(consultasMesGoals.map((m: unknown) => (m as Record<string, unknown>).user_id).filter(Boolean)),
    ] as string[];

    // appointmentCountByDentist maps user_id → count for O(1) lookup below.
    const appointmentCountByDentist: Record<string, number> = {};
    if (dentistIds.length > 0) {
      // Use snake_case column names matching the actual DB schema.
      const counts = await repo.groupAppointmentsByDentist(
        dentistIds,
        startMonth,
      );
      for (const row of counts) {
        appointmentCountByDentist[row.dentist_id] = row._count?._all ?? 0;
      }
    }

    // Process each goal using pre-fetched data – no additional DB round-trips.
    for (const meta of metas as any[]) {
      let progress = 0;
      let isCompleted = false;

      if (meta.type === "CONSULTAS_MES") {
        const count = appointmentCountByDentist[meta.user_id] ?? 0;
        progress = (count / meta.target_value) * 100;
        isCompleted = count >= meta.target_value;
      }

      const completedAt = isCompleted ? new Date() : null;
      await repo.updateGamificationGoal(meta.id, meta.clinic_id, {
        current_value: Math.round(progress),
        status: isCompleted ? "COMPLETED" : "ACTIVE",
        completed_at: completedAt,
      });
    }

    logger.info("[Gamificação] Finalizado com sucesso");
  } catch (error) {
    logger.error("[Gamificação] Erro no job:", error);
  }
}
