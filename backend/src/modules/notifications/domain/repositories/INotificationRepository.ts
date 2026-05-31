export interface INotificationRepository {
  // ── Appointments ──────────────────────────────────────────────────────
  findUpcomingAppointments(
    tomorrowStart: string,
    tomorrowEnd: string,
  ): Promise<any[]>;

  // ── Notifications ─────────────────────────────────────────────────────
  findNotificationsByClinic(clinicId: string): Promise<any[]>;
  createNotification(data: Record<string, unknown>): Promise<any>;
  markNotificationRead(id: string, clinicId: string): Promise<any>;
  markAllNotificationsRead(clinicId: string): Promise<any>;

  // ── Crypto Price Alerts ───────────────────────────────────────────────
  findActiveVolatilityAlerts(): Promise<any[]>;
  updateCryptoAlert(id: string, data: Record<string, unknown>): Promise<any>;
  findCryptoAlertsByCascadeGroup(
    cascadeGroupId: string,
    cascadeOrder: number,
  ): Promise<any[]>;

  // ── Crypto Exchange Rates ─────────────────────────────────────────────
  findLatestCryptoRate(coinType: string): Promise<any | null>;

  // ── Users ─────────────────────────────────────────────────────────────
  findAdminsByClinic(clinicId: string | undefined): Promise<any[]>;

  // ── Audit Logs ────────────────────────────────────────────────────────
  createAuditLog(data: Record<string, unknown>): Promise<any>;

  // ── Stock Alerts ──────────────────────────────────────────────────────
  createStockAlert(data: Record<string, unknown>): Promise<any>;

  // ── Raw SQL Queries ───────────────────────────────────────────────────
  findOverduePayments(today: Date): Promise<any[]>;
  findLowStockProducts(): Promise<any[]>;
  findBirthdayPatients(month: number, day: number): Promise<any[]>;
  findActiveCryptoPriceAlertsWithEmail(): Promise<any[]>;
  findLowStockInventoryProducts(): Promise<any[]>;
}
