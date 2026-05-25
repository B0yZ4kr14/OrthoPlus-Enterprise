import { prisma } from "@/infrastructure/database/prismaClient";

export class NotificationRepository {
  // ── Appointments ──────────────────────────────────────────────────────

  async findUpcomingAppointments(tomorrowStart: string, tomorrowEnd: string) {
    return prisma.appointments.findMany({
      where: {
        start_time: { gte: tomorrowStart, lte: tomorrowEnd },
        status: "agendado",
      },
      include: {
        patient: { select: { full_name: true } },
      },
      take: 1000,
    });
  }

  // ── Notifications ─────────────────────────────────────────────────────

  async createNotification(data: any) {
    return (prisma as any).notifications.create({ data });
  }

  // ── Crypto Price Alerts ───────────────────────────────────────────────

  async findActiveVolatilityAlerts() {
    return (prisma as any).crypto_price_alerts.findMany({
      where: { alert_type: "VOLATILITY", is_active: true },
      take: 100,
    });
  }

  async updateCryptoAlert(id: string, data: any) {
    return (prisma as any).crypto_price_alerts.update({ where: { id }, data });
  }

  async findCryptoAlertsByCascadeGroup(
    cascadeGroupId: string,
    cascadeOrder: number
  ) {
    return prisma.crypto_price_alerts.findMany({
      where: {
        cascade_group_id: cascadeGroupId,
        cascade_order: { lt: cascadeOrder },
        last_triggered_at: null,
      },
      select: { id: true },
    });
  }

  // ── Crypto Exchange Rates ─────────────────────────────────────────────

  async findLatestCryptoRate(coinType: string) {
    return prisma.crypto_exchange_rates.findFirst({
      where: { coin_type: coinType },
      orderBy: { timestamp: "desc" },
      select: { rate_brl: true },
    });
  }

  // ── Users ─────────────────────────────────────────────────────────────

  async findAdminsByClinic(clinicId: string | undefined) {
    return prisma.users.findMany({
      where: {
        clinic_id: clinicId || undefined,
        role: "ADMIN",
      },
      select: { email: true },
    });
  }

  // ── Audit Logs ────────────────────────────────────────────────────────

  async createAuditLog(data: any) {
    return (prisma as any).audit_logs.create({ data });
  }

  // ── Stock Alerts ──────────────────────────────────────────────────────

  async createStockAlert(data: any) {
    return (prisma as any).estoque_alertas.create({ data });
  }
}
