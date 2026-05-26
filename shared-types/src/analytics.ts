/**
 * Analytics / Dashboard Module Types
 * Shared between backend and frontend
 */

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingTreatments: number;
  completedTreatments: number;
}

export interface DashboardChartData {
  labels: string[];
  revenue: number[];
  expenses: number[];
  appointments: number[];
  newPatients: number[];
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardChartData;
  period: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Marketing ROI
// ============================================================================

export interface CampaignRoi {
  campaign: string;
  budget: number;
  patients: number;
  cac: number;
  revenue: number;
  roi: number;
}

export interface MarketingMetrics {
  totalBudget: number;
  cac: number;
  roi: number;
  totalPatients: number;
  totalRevenue: number;
  campaignRoi: CampaignRoi[];
}

// ============================================================================
// BI Export
// ============================================================================

export type BiExportFormat = "csv" | "xlsx" | "json";
export type BiExportStatus = "pending" | "processing" | "completed" | "failed";

export interface BiExportJob {
  id: string;
  clinicId: string;
  format: BiExportFormat;
  status: BiExportStatus;
  filters?: Record<string, unknown>;
  fileUrl?: string;
  createdAt: string;
  completedAt?: string;
}
