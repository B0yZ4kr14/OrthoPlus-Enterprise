import { prisma } from "@/infrastructure/database/prismaClient"
import { IAnalyticsRepository } from "../domain/repositories/IAnalyticsRepository"

/**
 * AnalyticsRepository — encapsulates all database access for analytics queries.
 */

export class AnalyticsRepository implements IAnalyticsRepository {
  // ── Dashboard Overview ────────────────────────────────────────────────

  async countPatients(clinicId: string): Promise<number> {
    try {
      return await prisma.patients.count({
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

      return await prisma.appointments.count({
        where: {
          clinic_id: clinicId,
          start_time: { gte: today.toISOString(), lt: tomorrow.toISOString() },
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

      const sumResult = await prisma.financial_transactions.aggregate({
        _sum: { amount: true },
        where: {
          clinic_id: clinicId,
          type: "RECEITA",
          transaction_date: { gte: firstDayOfMonth.toISOString().split("T")[0] },
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

      const totalAppointments = await prisma.appointments.count({
        where: {
          clinic_id: clinicId,
          start_time: { gte: today.toISOString(), lt: tomorrow.toISOString() },
        },
      })

      const dentistsCount = await prisma.profiles.count({
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
      return await prisma.pep_tratamentos.count({
        where: { prontuario: { clinic_id: clinicId }, status },
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
      const where: Record<string, unknown> = {
        clinic_id: clinicId,
        type,
        status: "PAGO",
        created_at: { gte: startDate },
      }
      if (endDate) {
        (where.created_at as Record<string, Date>).lt = endDate
      }
      const result = await prisma.financial_transactions.aggregate({
        _sum: { amount: true },
        where: where as any,
      })
      return Number(result._sum.amount) || 0
    } catch {
      return 0
    }
  }

  async getAppointmentsForPeriod(
    clinicId: string,
    startDate: Date,
  ): Promise<Array<{ start_time: string; end_time: string; status: string }>> {
    try {
      return await prisma.appointments.findMany({
        where: { clinic_id: clinicId, start_time: { gte: startDate.toISOString() } },
        select: { start_time: true, end_time: true, status: true },
        take: 1000,
      })
    } catch {
      return []
    }
  }

  async getUniquePayingPatients(clinicId: string, startDate: Date): Promise<number> {
    try {
      const result = await prisma.contas_receber.groupBy({
        by: ["patient_id"],
        where: {
          clinic_id: clinicId,
          status: "PAGO",
          created_at: { gte: startDate },
          patient_id: { not: null },
        },
      })
      return result.length
    } catch {
      return 0
    }
  }

  async getPendingReceivables(clinicId: string): Promise<Array<{ data_vencimento: string }>> {
    try {
      return await prisma.contas_receber.findMany({
        where: {
          clinic_id: clinicId,
          status: "PENDENTE",
        },
        select: { data_vencimento: true },
        take: 1000,
      })
    } catch {
      return []
    }
  }

  async countLeads(clinicId: string, startDate: Date): Promise<number> {
    try {
      return await prisma.crm_leads.count({
        where: { clinic_id: clinicId, created_at: { gte: startDate } },
      })
    } catch {
      return 0
    }
  }

  async countConvertedLeads(clinicId: string, startDate: Date): Promise<number> {
    try {
      return await prisma.crm_leads.count({
        where: {
          clinic_id: clinicId,
          status: "CONVERTIDO",
          created_at: { gte: startDate },
        },
      })
    } catch {
      return 0
    }
  }

  async getMarketingExpenses(clinicId: string, startDate: Date): Promise<number> {
    try {
      const result = await prisma.financial_transactions.aggregate({
        _sum: { amount: true },
        where: {
          clinic_id: clinicId,
          type: "DESPESA",
          category: "MARKETING",
          created_at: { gte: startDate },
        },
      })
      return Number(result._sum.amount) || 0
    } catch {
      return 0
    }
  }

  // ── Marketing ROI ─────────────────────────────────────────────────────

  async findPatientsWithMarketing(clinicId: string) {
    return prisma.patients.findMany({
      where: { clinic_id: clinicId, marketing_campaign: { not: null } },
      select: {
        id: true,
        marketing_campaign: true,
        marketing_source: true,
        first_appointment_date: true,
        created_at: true,
      },
      take: 1000,
    });
  }

  async findMarketingCampaigns(clinicId: string) {
    return prisma.marketing_campaigns.findMany({
      where: { clinic_id: clinicId },
      select: {
        id: true,
        name: true,
        target_audience: true,
        status: true,
        created_at: true,
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
    return prisma.appointments.count({
      where: {
        dentist_id: dentistId,
        status: "CONCLUIDA",
        start_time: { gte: startMonth.toISOString() },
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
