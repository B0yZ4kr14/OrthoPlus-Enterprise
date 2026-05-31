import { logger } from "@/infrastructure/logger";
import { AnalyticsRepository } from "@/modules/analytics/infrastructure/AnalyticsRepository";
import { GetDashboardOverviewUseCase } from "@/modules/analytics/application/GetDashboardOverviewUseCase";
import { GetUnifiedMetricsUseCase } from "@/modules/analytics/application/GetUnifiedMetricsUseCase";
import { Errors } from "@/middleware/errorHandler";

export interface MarketingROIResult {
  metrics: {
    totalBudget: number;
    cac: number;
    totalPatients: number;
    convertedPatients: number;
    conversionRate: number;
    roi: number;
    campaignROI: Array<{
      campaign: string;
      budget: number;
      patients: number;
      converted: number;
      conversionRate: number;
      cac: number;
    }>;
    sourcePerformance: Array<{
      source: string;
      total: number;
      converted: number;
      conversionRate: number;
    }>;
  };
}

export interface SidebarBadgesResult {
  badges: {
    appointments: number;
    overdue: number;
    defaulters: number;
    recalls: number;
    messages: number;
  };
}

export class AnalyticsControllerService {
  private repo = new AnalyticsRepository();
  private getDashboardOverviewUseCase = new GetDashboardOverviewUseCase(
    this.repo,
  );
  private getUnifiedMetricsUseCase = new GetUnifiedMetricsUseCase();

  async getDashboardOverview(clinicId: string) {
    return this.getDashboardOverviewUseCase.execute(clinicId);
  }

  async getUnifiedMetrics(clinicId: string) {
    return this.getUnifiedMetricsUseCase.execute(clinicId);
  }

  async getMarketingROI(clinicId: string): Promise<MarketingROIResult> {
    const patients = await this.repo.findPatientsWithMarketing(clinicId);
    const campaigns = await this.repo.findMarketingCampaigns(clinicId);

    const totalPatients = patients.length;
    const convertedPatients = patients.filter(
      (p) => (p as any).first_appointment_date,
    ).length;

    const totalBudget = 0;
    const cac = 0;
    const conversionRate =
      totalPatients > 0 ? (convertedPatients / totalPatients) * 100 : 0;

    const campaignROI = campaigns.map((campaign) => {
      const campaignPatients = patients.filter(
        (p) => (p as any).marketing_campaign === campaign.name,
      );
      const converted = campaignPatients.filter(
        (p) => (p as any).first_appointment_date,
      ).length;

      return {
        campaign: campaign.name,
        budget: 0,
        patients: campaignPatients.length,
        converted,
        conversionRate:
          campaignPatients.length > 0
            ? (converted / campaignPatients.length) * 100
            : 0,
        cac: 0,
      };
    });

    const sourcePerformanceAcc: Record<
      string,
      { total: number; converted: number }
    > = {};

    patients.forEach((p) => {
      const source = (p as any).marketing_source || "Nao especificado";
      if (!sourcePerformanceAcc[source]) {
        sourcePerformanceAcc[source] = { total: 0, converted: 0 };
      }
      sourcePerformanceAcc[source].total++;
      if ((p as any).first_appointment_date) {
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

    return {
      metrics: {
        totalBudget,
        cac,
        totalPatients,
        convertedPatients,
        conversionRate,
        roi: 0,
        campaignROI,
        sourcePerformance,
      },
    };
  }

  async processAnalytics(
    clinicId: string,
    body: {
      action: string;
      userId?: string;
      patientId?: string;
      points?: number;
      goalType?: string;
      analyticsData?: Record<string, unknown>;
    },
  ) {
    const { action, userId, patientId, points, goalType, analyticsData } = body;

    switch (action) {
      case "loyalty-points":
        if (!patientId) throw Errors.validation("patientId required");
        return this.processLoyaltyPoints(clinicId, patientId, points || 0);

      case "gamification-goals":
        if (!userId) throw Errors.validation("userId required");
        return this.processGamificationGoals(clinicId, userId, goalType);

      case "bi-export":
        return this.scheduleBIExport(clinicId);

      case "onboarding-analytics":
        if (!analyticsData) throw Errors.validation("analyticsData required");
        analyticsData.clinicId = clinicId;
        return this.saveOnboardingAnalytics(analyticsData);

      default:
        throw Errors.validation(`Unknown action: ${action}`);
    }
  }

  private async processLoyaltyPoints(
    clinicId: string,
    patientId: string,
    points: number,
  ) {
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
      const goals = await this.repo.findActiveGamificationGoals(
        clinicId,
        userId,
      );
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
              startMonth,
            );
            progress = (count / goal.target_value) * 100;
            isCompleted = count >= goal.target_value;
            break;
          }

          case "RECEITA_MES":
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

  private async saveOnboardingAnalytics(
    analyticsData: Record<string, unknown>,
  ) {
    try {
      const { userId, clinicId, step, action, duration, metadata } =
        analyticsData;
      await this.repo.createOnboardingAnalytics({
        user_id: userId as string,
        clinic_id: clinicId as string,
        step_name: step as string,
        event_type: action as string,
        time_spent_seconds: duration as number,
        metadata: (metadata || {}) as any,
      });
      return { userId, step, action, saved_at: new Date() };
    } catch (e) {
      return { error: e };
    }
  }

  async getSidebarBadges(clinicId: string): Promise<SidebarBadgesResult> {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = new Date(today.getTime() + 86400000)
      .toISOString()
      .split("T")[0];

    const [appointments, overdue, recalls] = await Promise.all([
      this.repo
        .countAppointmentsToday(clinicId, todayStr, tomorrowStr)
        .catch((err) => {
          logger.error("Failed to count appointments today", { clinicId, error: err })
          return 0
        }),
      this.repo.countOverdueContasReceber(clinicId, todayStr).catch((err) => {
        logger.error("Failed to count overdue contas", { clinicId, error: err })
        return 0
      }),
      this.repo
        .countRecallsToday(clinicId, todayStr, tomorrowStr)
        .catch((err) => {
          logger.error("Failed to count recalls today", { clinicId, error: err })
          return 0
        }),
    ]);

    return {
      badges: {
        appointments,
        overdue,
        defaulters: overdue,
        recalls,
        messages: 0,
      },
    };
  }
}
