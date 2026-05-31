import { prisma } from "@/infrastructure/database/prismaClient";
import { INotificationRepository } from "@/modules/notifications/domain/repositories/INotificationRepository";

export class NotificationRepository implements INotificationRepository {
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

  async findNotificationsByClinic(clinicId: string) {
    return prisma.notifications.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
      take: 100,
      select: {
        id: true,
        clinic_id: true,
        tipo: true,
        titulo: true,
        mensagem: true,
        link_acao: true,
        lida: true,
        created_at: true,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createNotification(data: Record<string, unknown>) {
    return prisma.notifications.create({ data: data as any });
  }

  async markNotificationRead(id: string, clinicId: string) {
    return prisma.notifications.updateMany({
      where: { id, clinic_id: clinicId },
      data: { lida: true },
    });
  }

  async markAllNotificationsRead(clinicId: string) {
    return prisma.notifications.updateMany({
      where: { clinic_id: clinicId, lida: false },
      data: { lida: true },
    });
  }

  // ── Crypto Price Alerts ───────────────────────────────────────────────

  async findActiveVolatilityAlerts() {
    return prisma.crypto_price_alerts.findMany({
      where: { alert_type: "VOLATILITY", is_active: true },
      take: 100,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateCryptoAlert(id: string, data: Record<string, unknown>) {
    return prisma.crypto_price_alerts.update({ where: { id }, data: data as any });
  }

  async findCryptoAlertsByCascadeGroup(
    cascadeGroupId: string,
    cascadeOrder: number,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAuditLog(data: Record<string, unknown>) {
    return prisma.audit_logs.create({ data: data as any });
  }

  // ── Stock Alerts ──────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createStockAlert(data: Record<string, unknown>) {
    return prisma.estoque_alertas.create({ data: data as any });
  }

  // ── Raw SQL Queries (Prisma limitations: cross-column comparisons, EXTRACT, JOINs) ──

  async findOverduePayments(today: Date) {
    return prisma.$queryRaw<
      Array<{
        clinic_id: string;
        patient_name: string | null;
      }>
    >`
      SELECT cr.clinic_id, p.full_name as patient_name
      FROM contas_receber cr
      LEFT JOIN patients p ON cr.patient_id = p.id
      WHERE cr.data_vencimento < ${today}
      AND cr.status IN ('PENDENTE', 'ATRASADO')
      LIMIT 1000
    `;
  }

  async findLowStockProducts() {
    return prisma.$queryRaw<
      Array<{
        clinic_id: string;
        nome: string;
        quantidade_atual: number;
      }>
    >`
      SELECT clinic_id, nome, quantidade_atual
      FROM produtos
      WHERE quantidade_atual <= quantidade_minima
      LIMIT 1000
    `;
  }

  async findBirthdayPatients(month: number, day: number) {
    return prisma.$queryRaw<
      Array<{
        clinic_id: string;
        patient_name: string | null;
      }>
    >`
      SELECT p.clinic_id, pat.full_name as patient_name
      FROM prontuarios p
      JOIN patients pat ON p.patient_id = pat.id
      WHERE EXTRACT(MONTH FROM p.data_nascimento) = ${month}
      AND EXTRACT(DAY FROM p.data_nascimento) = ${day}
      LIMIT 1000
    `;
  }

  async findActiveCryptoPriceAlertsWithEmail() {
    return prisma.$queryRaw<
      Array<{
        id: string;
        email: string | null;
        coin_type: string;
        alert_type: string;
        target_rate_brl: number;
        cascade_enabled: boolean;
        cascade_order: number;
        cascade_group_id: string;
        last_triggered_at: string | null;
        notification_method: string | null;
        clinic_id: string;
        created_by: string;
      }>
    >`
      SELECT
        cpa.id, p.email, cpa.coin_type, cpa.alert_type, cpa.target_rate_brl,
        cpa.cascade_enabled, cpa.cascade_order, cpa.cascade_group_id,
        cpa.last_triggered_at, cpa.notification_method, cpa.clinic_id, cpa.created_by
      FROM crypto_price_alerts cpa
      LEFT JOIN profiles p ON cpa.created_by = p.id
      WHERE cpa.is_active = true
      LIMIT 100
    `;
  }

  async findLowStockInventoryProducts() {
    return prisma.$queryRaw<
      Array<{
        id: string;
        nome: string;
        quantidade_atual: number;
        quantidade_minima: number;
        clinic_id: string;
      }>
    >`
      SELECT id, nome, quantidade_atual, quantidade_minima, clinic_id
      FROM inventario.produtos
      WHERE quantidade_atual <= quantidade_minima
      LIMIT 1000
    `;
  }
}
