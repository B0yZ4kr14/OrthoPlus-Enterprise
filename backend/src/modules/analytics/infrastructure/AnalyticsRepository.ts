import { prisma } from "@/infrastructure/database/prismaClient"

/**
 * AnalyticsRepository — encapsulates all database access for analytics queries.
 */

export class AnalyticsRepository {
  // ── Dashboard Overview ────────────────────────────────────────────────

  async countPatients(clinicId: string): Promise<number> {
    try {
      return await (prisma as any).patients.count({
        where: { clinic_id: clinicId },
      })
    } catch {
      return 0
    }
  }

  async countTodayAppointments(clinicId: string): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      return await (prisma as any).appointments.count({
        where: {
          clinic_id: clinicId,
          startTime: { gte: today, lt: tomorrow },
        },
      })
    } catch {
      return 0
    }
  }

  async getMonthlyRevenue(clinicId: string): Promise<number> {
    try {
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      )

      const sumResult = await (prisma as any).financial_transactions.aggregate({
        _sum: { amount: true },
        where: {
          clinic_id: clinicId,
          type: "RECEITA",
          date: { gte: firstDayOfMonth },
        },
      })

      return sumResult._sum.amount ? Number(sumResult._sum.amount) : 0
    } catch {
      return 0
    }
  }

  async calculateOccupancyRate(clinicId: string): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const totalAppointments = await (prisma as any).appointments.count({
        where: {
          clinic_id: clinicId,
          startTime: { gte: today, lt: tomorrow },
        },
      })

      const dentistsCount = await (prisma as any).profiles.count({
        where: { clinic_id: clinicId },
      })

      const totalSlots = (dentistsCount || 1) * 8
      return totalSlots > 0 ? (totalAppointments / totalSlots) * 100 : 0
    } catch {
      return 0
    }
  }

  async countTreatmentsByStatus(
    clinicId: string,
    status: string,
  ): Promise<number> {
    try {
      return await (prisma as any).pep_tratamentos.count({
        where: { clinic_id: clinicId, status },
      })
    } catch {
      return 0
    }
  }

  // ── Unified Metrics ───────────────────────────────────────────────────

  async aggregateRevenue(
    clinicId: string,
    type: string,
    startDate: Date,
    endDate?: Date,
  ): Promise<number> {
    try {
      const where: any = {
        clinic_id: clinicId,
        type,
        status: "PAGO",
        createdAt: { gte: startDate },
      }
      if (endDate) {
        where.createdAt.lt = endDate
      }
      const result = await (prisma as any).financial_transactions.aggregate({
        _sum: { amount: true },
        where,
      })
      return Number(result._sum.amount) || 0
    } catch {
      return 0
    }
  }

  async getAppointmentsForPeriod(
    clinicId: string,
    startDate: Date,
  ): Promise<Array<{ startTime: Date; endTime: Date | null; status: string }>> {
    try {
      return await (prisma as any).appointments.findMany({
        where: { clinic_id: clinicId, startTime: { gte: startDate } },
        select: { startTime: true, endTime: true, status: true },
        take: 1000,
      })
    } catch {
      return []
    }
  }

  async getUniquePayingPatients(clinicId: string, startDate: Date): Promise<number> {
    try {
      const result = await (prisma as any).financial_transactions.groupBy({
        by: ["patientId"],
        where: {
          clinic_id: clinicId,
          type: "RECEITA",
          status: "PAGO",
          createdAt: { gte: startDate },
          patientId: { not: null },
        },
      })
      return result.length
    } catch {
      return 0
    }
  }

  async getPendingReceivables(clinicId: string): Promise<Array<{ dataVencimento: string | null }>> {
    try {
      return await (prisma as any).financial_transactions.findMany({
        where: {
          clinic_id: clinicId,
          type: "RECEITA",
          status: "PENDENTE",
        },
        select: { dataVencimento: true },
        take: 1000,
      })
    } catch {
      return []
    }
  }

  async countLeads(clinicId: string, startDate: Date): Promise<number> {
    try {
      return await (prisma as any).crm_leads.count({
        where: { clinic_id: clinicId, createdAt: { gte: startDate } },
      })
    } catch {
      return 0
    }
  }

  async countConvertedLeads(clinicId: string, startDate: Date): Promise<number> {
    try {
      return await (prisma as any).crm_leads.count({
        where: {
          clinic_id: clinicId,
          statusFunil: "CONVERTIDO",
          createdAt: { gte: startDate },
        },
      })
    } catch {
      return 0
    }
  }

  async getMarketingExpenses(clinicId: string, startDate: Date): Promise<number> {
    try {
      const result = await (prisma as any).financial_transactions.aggregate({
        _sum: { amount: true },
        where: {
          clinic_id: clinicId,
          type: "DESPESA",
          categoria: "MARKETING",
          createdAt: { gte: startDate },
        },
      })
      return Number(result._sum.amount) || 0
    } catch {
      return 0
    }
  }

  // ── Marketing ROI ─────────────────────────────────────────────────────

  async findPatientsWithMarketing(clinicId: string) {
    return (prisma as any).patients.findMany({
      where: { clinic_id: clinicId, marketingCampaign: { not: null } },
      select: {
        id: true,
        marketingCampaign: true,
        marketingSource: true,
        createdAt: true,
        status: true,
      },
      take: 1000,
    });
  }

  async findMarketingCampaigns(clinicId: string) {
    return (prisma as any).marketing_campaigns.findMany({
      where: { clinic_id: clinicId },
      select: {
        id: true,
        name: true,
        budget: true,
        targetAudience: true,
        status: true,
        createdAt: true,
      },
      take: 100,
    });
  }

  // ── Loyalty Points ────────────────────────────────────────────────────

  async findLoyaltyByPatient(clinicId: string, patientId: string) {
    return prisma.fidelidade_pacientes.findFirst({
      where: { clinic_id: clinicId, patient_id: patientId },
    });
  }

  async createLoyalty(data: any) {
    return prisma.fidelidade_pacientes.create({ data });
  }

  async updateLoyalty(id: string, data: any) {
    return prisma.fidelidade_pacientes.update({ where: { id }, data });
  }

  async createLoyaltyTransaction(data: any) {
    return prisma.fidelidade_transacoes.create({ data });
  }

  // ── Gamification ──────────────────────────────────────────────────────

  async findActiveGamificationGoals(clinicId: string, userId: string) {
    return prisma.gamification_goals.findMany({
      where: {
        clinic_id: clinicId,
        user_id: userId,
        status: "ACTIVE",
        deadline: { gte: new Date() },
      },
      take: 1000,
    });
  }

  async countAppointmentsByDentist(dentistId: string, startMonth: Date) {
    return (prisma as any).appointments.count({
      where: {
        dentistId: dentistId,
        status: "CONCLUIDA",
        startTime: { gte: startMonth },
      },
    });
  }

  async updateGamificationGoal(id: string, data: any) {
    return prisma.gamification_goals.update({ where: { id }, data });
  }

  // ── BI Export ─────────────────────────────────────────────────────────

  async createBIExportJob(data: any) {
    return prisma.bi_export_jobs.create({ data });
  }

  // ── Onboarding ────────────────────────────────────────────────────────

  async createOnboardingAnalytics(data: any) {
    return prisma.onboarding_analytics.create({ data });
  }

  // ── Sidebar Badges ────────────────────────────────────────────────────

  async countAppointmentsToday(clinicId: string, todayStr: string, tomorrowStr: string) {
    return prisma.appointments.count({
      where: {
        clinic_id: clinicId,
        start_time: { gte: todayStr, lt: tomorrowStr },
      },
    });
  }

  async countOverdueContasReceber(clinicId: string, todayStr: string) {
    return prisma.contas_receber.count({
      where: {
        clinic_id: clinicId,
        data_vencimento: { lt: todayStr },
        status: "PENDENTE",
      },
    });
  }

  async countRecallsToday(clinicId: string, todayStr: string, tomorrowStr: string) {
    return prisma.recalls.count({
      where: {
        clinic_id: clinicId,
        data_prevista: { gte: todayStr, lt: tomorrowStr },
      },
    });
  }
}
