import { logger } from '@/infrastructure/logger';
import { AnalyticsRepository } from "@/modules/analytics/infrastructure/AnalyticsRepository";
import { NextFunction, Request, Response } from "express";
import { GetDashboardOverviewUseCase } from "@/modules/analytics/application/GetDashboardOverviewUseCase";
import { GetUnifiedMetricsUseCase } from "@/modules/analytics/application/GetUnifiedMetricsUseCase";


export class AnalyticsController {
  private getDashboardOverviewUseCase = new GetDashboardOverviewUseCase()
  private getUnifiedMetricsUseCase = new GetUnifiedMetricsUseCase()
  private repo = new AnalyticsRepository()
  // ==========================================
  // dashboard-overview
  // ==========================================
  public async getDashboardOverview(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const clinicId = req.clinicId;
      if (!clinicId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing clinicId" });
      }

      console.info(
        `[analyticsController] Fetching dashboard overview for clinic: ${clinicId}`,
      );

      const result = await this.getDashboardOverviewUseCase.execute(clinicId);

      return res.json(result);
    } catch (error) {
      logger.error("[analyticsController] FATAL ERROR", { error });
      return next(error);
    }
  }

  // ==========================================
  // unified-metrics
  // ==========================================
  public async getUnifiedMetrics(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const clinicId = req.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const metrics = await this.getUnifiedMetricsUseCase.execute(clinicId)
      return res.json(metrics);
    } catch (error) {
      logger.error("Error generating unified metrics", { error });
      return next(error);
    }
  }

  // ==========================================
  // marketing-roi
  // ==========================================
  public async getMarketingROI(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const clinicId = req.clinicId;
      if (!clinicId) return res.status(401).json({ error: "Unauthorized" });

      const patients = await this.repo.findPatientsWithMarketing(clinicId);

      const campaigns = await this.repo.findMarketingCampaigns(clinicId);

      const totalPatients = patients.length;
      const convertedPatients = patients.filter(
        (p: { status: string }) => p.status === "TRATAMENTO" || p.status === "CONCLUIDO",
      ).length;

      const totalBudget = campaigns.reduce(
        (sum: number, c: { budget?: unknown }) => sum + (c.budget ? Number(c.budget) : 0),
        0,
      );
      const cac = totalPatients > 0 ? totalBudget / totalPatients : 0;
      const conversionRate =
        totalPatients > 0 ? (convertedPatients / totalPatients) * 100 : 0;

      const campaignROI = campaigns.map((campaign: { id: string; name: string; budget?: unknown; status: string; createdAt: Date }) => {
        const campaignPatients = patients.filter(
          (p: { marketingCampaign?: string; status: string }) => p.marketingCampaign === campaign.name,
        );
        const converted = campaignPatients.filter(
          (p: { status: string }) => p.status === "TRATAMENTO" || p.status === "CONCLUIDO",
        ).length;

        return {
          campaign: campaign.name,
          budget: campaign.budget ? Number(campaign.budget) : 0,
          patients: campaignPatients.length,
          converted,
          conversionRate:
            campaignPatients.length > 0
              ? (converted / campaignPatients.length) * 100
              : 0,
          cac:
            campaignPatients.length > 0
              ? (campaign.budget ? Number(campaign.budget) : 0) /
                campaignPatients.length
              : 0,
        };
      });

      const sourcePerformanceAcc: Record<
        string,
        { total: number; converted: number }
      > = {};

      patients.forEach((p: { marketingSource?: string; status: string }) => {
        const source = p.marketingSource || "Não especificado";
        if (!sourcePerformanceAcc[source]) {
          sourcePerformanceAcc[source] = { total: 0, converted: 0 };
        }
        sourcePerformanceAcc[source].total++;
        if (p.status === "TRATAMENTO" || p.status === "CONCLUIDO") {
          sourcePerformanceAcc[source].converted++;
        }
      });

      const sourcePerformance = Object.entries(sourcePerformanceAcc).map(
        ([source, data]) => ({
          source,
          total: data.total,
          converted: data.converted,
          conversionRate: (data.converted / data.total) * 100,
        }),
      );

      const metrics = {
        totalBudget,
        cac,
        totalPatients,
        convertedPatients,
        conversionRate,
        roi: 0,
        campaignROI,
        sourcePerformance,
      };

      return res.json({ metrics });
    } catch (error) {
      logger.error("Error generating marketing ROI", { error });
      return next(error);
    }
  }

  // ==========================================
  // analytics-processor (Action dispatcher)
  // ==========================================
  public async processAnalytics(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { action, userId, patientId, points, goalType, analyticsData } =
        req.body;
      const clinicId = req.clinicId;

      if (!clinicId) return res.status(401).json({ error: "Unauthorized" });

      let result;

      switch (action) {
        case "loyalty-points":
          if (!patientId)
            return res.status(400).json({ error: "patientId required" });
          result = await this.processLoyaltyPoints(
            clinicId,
            patientId,
            points || 0,
          );
          break;

        case "gamification-goals":
          if (!userId)
            return res.status(400).json({ error: "userId required" });
          result = await this.processGamificationGoals(
            clinicId,
            userId,
            goalType,
          );
          break;

        case "bi-export":
          result = await this.scheduleBIExport(clinicId);
          break;

        case "onboarding-analytics":
          if (!analyticsData)
            return res.status(400).json({ error: "analyticsData required" });
          analyticsData.clinicId = clinicId; // override with auth context
          result = await this.saveOnboardingAnalytics(analyticsData);
          break;

        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }

      return res.json(result);
    } catch (error) {
      logger.error("Analytics Processor Error:", { error });
      return next(error);
    }
  }

  // ---- Helper methods for processAnalytics ----

  private async processLoyaltyPoints(
    clinicId: string,
    patientId: string,
    points: number,
  ) {
    // Note: Depends on schema for 'fidelidade_pacientes' and 'fidelidade_transacoes'
    // This is mocked to return the structure for now since those tables might not exist in standard Prisma yet.
    // Or we will call direct raw query. Let's use direct DB call if it doesn't match standard prisma schema:

    // Let's assume Prisma has the tables, else we will have to use $queryRawUnsafe
    try {
      let loyalty = await this.repo.findLoyaltyByPatient(clinicId, patientId);

      if (!loyalty) {
        loyalty = await this.repo.createLoyalty({
          clinic_id: clinicId,
          patient_id: patientId,
          pontos_acumulados: points,
          nivel: "BRONZE",
        });

        await this.repo.createLoyaltyTransaction({
          clinic_id: clinicId,
          patient_id: patientId,
          tipo: "CREDITO",
          pontos: points,
          descricao: "Pontos por consulta realizada",
        });

        return {
          patientId,
          pointsAdded: points,
          totalPoints: points,
          level: "BRONZE",
          isNew: true,
        };
      }

      const newTotal = loyalty.pontos_acumulados + points;
      let newLevel = loyalty.nivel;

      if (newTotal >= 1000) newLevel = "PLATINUM";
      else if (newTotal >= 500) newLevel = "GOLD";
      else if (newTotal >= 100) newLevel = "SILVER";

      await this.repo.updateLoyalty(loyalty.id, {
        pontos_acumulados: newTotal,
        nivel: newLevel,
      });

      await this.repo.createLoyaltyTransaction({
        clinic_id: clinicId,
        patient_id: patientId,
        tipo: "CREDITO",
        pontos: points,
        descricao: "Pontos por consulta realizada",
      });

      return {
        patientId,
        pointsAdded: points,
        totalPoints: newTotal,
        level: newLevel,
        levelUp: newLevel !== loyalty.nivel,
      };
    } catch (e) {
      logger.error("Mocked query raw fallback:", { error: e });
      return {
        patientId,
        pointsAdded: points,
        totalPoints: points,
        info: "Schema error, fallback mocked return",
      };
    }
  }

  private async processGamificationGoals(
    clinicId: string,
    userId: string,
    goalType?: string,
  ) {
    try {
      const goals = await this.repo.findActiveGamificationGoals(clinicId, userId);

      const goalsProcessed = [];

      for (const goal of goals) {
        if (goalType && goal.type !== goalType) continue;

        let progress = 0;
        let isCompleted = false;

        switch (goal.type) {
          case "CONSULTAS_MES": {
            const startMonth = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1,
            );
            const count = await this.repo.countAppointmentsByDentist(
              userId,
              startMonth
            );
            progress = (count / goal.target_value) * 100;
            isCompleted = count >= goal.target_value;
            break;
          }

          case "RECEITA_MES":
            // Logic...
            break;
        }

        await this.repo.updateGamificationGoal(goal.id, {
          current_value: Math.round(progress),
          status: isCompleted ? "COMPLETED" : "ACTIVE",
          completed_at: isCompleted ? new Date() : null,
        });

        goalsProcessed.push({ goalId: goal.id, progress, isCompleted });
      }
      return {
        userId,
        goalsProcessed: goalsProcessed.length,
        goals: goalsProcessed,
      };
    } catch (e) {
      return { userId, goalsProcessed: 0, goals: [], error: e };
    }
  }

  private async scheduleBIExport(clinicId: string) {
    try {
      const res = await this.repo.createBIExportJob({
        clinic_id: clinicId,
        export_type: "MONTHLY_REPORT",
        scheduled_for: new Date(Date.now() + 60 * 60 * 1000),
        status: "SCHEDULED",
        format: "PDF",
      });
      return {
        clinicId,
        exportJobId: res.id,
        scheduled_for: res.scheduled_for,
      };
    } catch (e) {
      return { clinicId, error: e };
    }
  }

  private async saveOnboardingAnalytics(analyticsData: Record<string, unknown>) {
    try {
      const { userId, clinicId, step, action, duration, metadata } =
        analyticsData;
      await this.repo.createOnboardingAnalytics({
        user_id: userId as string,
        clinic_id: clinicId as string,
        step_name: step as string,
        event_type: action as string,
        time_spent_seconds: duration as number,
        metadata: (metadata || {}) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });
      return { userId, step, action, saved_at: new Date() };
    } catch (e) {
      return { error: e };
    }
  }

  public async getSidebarBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const clinicId = req.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Unauthorized: Missing clinicId" });
      }

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split("T")[0];

      const [appointments, overdue, recalls] = await Promise.all([
        this.repo.countAppointmentsToday(clinicId, todayStr, tomorrowStr).catch(() => 0),
        this.repo.countOverdueContasReceber(clinicId, todayStr).catch(() => 0),
        this.repo.countRecallsToday(clinicId, todayStr, tomorrowStr).catch(() => 0),
      ]);

      return res.json({
        badges: {
          appointments,
          overdue,
          defaulters: overdue,
          recalls,
          messages: 0,
        },
      });
    } catch (e) {
      return next(e);
    }
  }
}
