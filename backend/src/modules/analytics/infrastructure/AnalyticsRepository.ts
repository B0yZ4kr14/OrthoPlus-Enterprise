import { prisma } from "@/infrastructure/database/prismaClient"

/**
 * AnalyticsRepository — encapsulates all database access for analytics queries.
 */

export class AnalyticsRepository {
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
}
