/**
 * Analytics Repository Interface
 * Architecture Refactor T6.1 — Repository layer for analytics module.
 */

export interface IAnalyticsRepository {
  // Dashboard Overview
  countPatients(clinicId: string): Promise<number>;
  countTodayAppointments(clinicId: string): Promise<number>;
  getMonthlyRevenue(clinicId: string): Promise<number>;
  calculateOccupancyRate(clinicId: string): Promise<number>;
  countTreatmentsByStatus(clinicId: string, status: string): Promise<number>;

  // Unified Metrics
  aggregateRevenue(
    clinicId: string,
    type: string,
    startDate: Date,
    endDate?: Date,
  ): Promise<number>;
  getAppointmentsForPeriod(
    clinicId: string,
    startDate: Date,
  ): Promise<Array<{ start_time: string; end_time: string; status: string }>>;
  getUniquePayingPatients(clinicId: string, startDate: Date): Promise<number>;
  getPendingReceivables(
    clinicId: string,
  ): Promise<Array<{ data_vencimento: string }>>;
  countLeads(clinicId: string, startDate: Date): Promise<number>;
  countConvertedLeads(clinicId: string, startDate: Date): Promise<number>;
  getMarketingExpenses(clinicId: string, startDate: Date): Promise<number>;

  // Marketing ROI
  findPatientsWithMarketing(clinicId: string): Promise<unknown[]>;
  findMarketingCampaigns(clinicId: string): Promise<unknown[]>;

  // Loyalty
  findLoyaltyByPatient(
    clinicId: string,
    patientId: string,
  ): Promise<unknown | null>;
  createLoyalty(data: unknown): Promise<unknown>;
  updateLoyalty(id: string, clinicId: string, data: unknown): Promise<unknown>;
  createLoyaltyTransaction(data: unknown): Promise<unknown>;

  // Gamification
  findActiveGamificationGoals(
    clinicId: string,
    userId: string,
  ): Promise<unknown[]>;
  findAllActiveGamificationGoals(take: number): Promise<unknown[]>;
  countAppointmentsByDentist(
    dentistId: string,
    startMonth: Date,
  ): Promise<number>;
  groupAppointmentsByDentist(
    dentistIds: string[],
    startMonth: Date,
  ): Promise<Array<{ dentist_id: string; _count?: { _all: number } }>>;
  updateGamificationGoal(id: string, clinicId: string, data: unknown): Promise<unknown>;

  // BI Export
  createBIExportJob(data: unknown): Promise<unknown>;
  groupAnalyticsEventsByType(): Promise<
    Array<{ event_type: string; _count: { id: number } }>
  >;

  // Onboarding
  createOnboardingAnalytics(data: unknown): Promise<unknown>;

  // Sidebar Badges
  countAppointmentsToday(
    clinicId: string,
    todayStr: string,
    tomorrowStr: string,
  ): Promise<number>;
  countOverdueContasReceber(
    clinicId: string,
    todayStr: string,
  ): Promise<number>;
  countRecallsToday(
    clinicId: string,
    todayStr: string,
    tomorrowStr: string,
  ): Promise<number>;
}
