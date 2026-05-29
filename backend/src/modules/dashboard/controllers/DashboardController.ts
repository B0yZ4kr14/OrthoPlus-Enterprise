/**
 * Dashboard Controller - Fornece dados agregados para o Dashboard
 */

import { Request, Response } from "express";
import { IDatabaseConnection } from "@/infrastructure/database/IDatabaseConnection";
import { logger } from "@/infrastructure/logger";
import { dashboardMetrics } from "@/infrastructure/metrics/DashboardMetrics";

export class DashboardController {
  constructor(private db: IDatabaseConnection) {}

  /**
   * GET /api/dashboard/overview
   * Retorna dados consolidados do dashboard
   */
  async getOverview(req: Request, res: Response): Promise<void> {
    const clinicId = req.user?.clinicId;
    try {
      if (!clinicId) {
        dashboardMetrics.incRequests("unknown", "error_missing_clinic");
        res.status(400).json({ error: "Clinic ID is required" });
        return;
      }

      // Buscar estatísticas agregadas em paralelo — each is individually resilient
      const [stats, appointmentsData, revenueData, treatmentsByStatus] =
        await Promise.all([
          this.getStats(clinicId).catch(() => this.defaultStats()),
          this.getAppointmentsData(clinicId).catch(() => []),
          this.getRevenueData(clinicId).catch(() => []),
          this.getTreatmentsByStatus(clinicId).catch(() => []),
        ]);

      dashboardMetrics.incRequests(clinicId, "success");
      res.json({
        stats,
        appointmentsData,
        revenueData,
        treatmentsByStatus,
      });
    } catch (error) {
      logger.error("[DashboardController] Error fetching overview:", error);
      dashboardMetrics.incRequests(clinicId || "unknown", "error");
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  }

  private defaultStats() {
    return {
      totalPatients: 0,
      todayAppointments: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingTreatments: 0,
      completedTreatments: 0,
    };
  }

  private async getStats(clinicId: string) {
    const today = new Date().toISOString().split("T")[0];
    const todayPrefix = today + "%"; // appointments.start_time is a String

    const [
      totalPatientsResult,
      todayAppointmentsResult,
      monthlyRevenueResult,
      occupancyResult,
      pendingTreatmentsResult,
      completedTreatmentsResult,
    ] = await Promise.all([
      // Total de pacientes
      this.db.query(
        "SELECT COUNT(*) as count FROM pacientes.patients WHERE clinic_id = $1",
        [clinicId],
      ),
      // Consultas de hoje (start_time is a String like '2026-04-24T...')
      this.db.query(
        `SELECT COUNT(*) as count FROM pacientes.appointments
         WHERE clinic_id = $1 AND start_time LIKE $2`,
        [clinicId, todayPrefix],
      ),
      // Receita mensal (últimos 30 dias) — financial_transactions
      this.db.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM financeiro.financial_transactions
         WHERE clinic_id = $1
         AND type = 'RECEITA'
         AND transaction_date >= TO_CHAR(CURRENT_DATE - INTERVAL '30 days', 'YYYY-MM-DD')`,
        [clinicId],
      ),
      // Taxa de ocupação
      this.db.query(
        `SELECT
          COUNT(*) FILTER (WHERE status IN ('completed', 'confirmed')) as completed,
          COUNT(*) as total
         FROM pacientes.appointments
         WHERE clinic_id = $1
         AND start_time >= TO_CHAR(DATE_TRUNC('week', CURRENT_DATE), 'YYYY-MM-DD')
         AND start_time < TO_CHAR(DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days', 'YYYY-MM-DD')`,
        [clinicId],
      ),
      // Tratamentos pendentes (pep_tratamentos has no clinic_id — skip clinic filter)
      this.db.query(
        `SELECT COUNT(*) as count FROM pep.pep_tratamentos
         WHERE status = 'EM_ANDAMENTO'`,
        [],
      ),
      // Tratamentos concluídos (últimos 30 dias)
      this.db.query(
        `SELECT COUNT(*) as count FROM pep.pep_tratamentos
         WHERE status = 'CONCLUIDO'
         AND updated_at >= CURRENT_DATE - INTERVAL '30 days'`,
        [],
      ),
    ]);

    return {
      totalPatients: parseInt(totalPatientsResult.rows[0]?.count || "0"),
      todayAppointments: parseInt(
        todayAppointmentsResult.rows[0]?.count || "0",
      ),
      monthlyRevenue: parseFloat(monthlyRevenueResult.rows[0]?.total || "0"),
      occupancyRate:
        occupancyResult.rows[0]?.total > 0
          ? Math.round(
              (occupancyResult.rows[0].completed /
                occupancyResult.rows[0].total) *
                100,
            )
          : 0,
      pendingTreatments: parseInt(
        pendingTreatmentsResult.rows[0]?.count || "0",
      ),
      completedTreatments: parseInt(
        completedTreatmentsResult.rows[0]?.count || "0",
      ),
    };
  }

  private async getAppointmentsData(clinicId: string) {
    // Consultas da última semana — start_time is a String
    const result = await this.db.query(
      `SELECT
        TO_CHAR(start_time::timestamp, 'Dy') as name,
        COUNT(*) FILTER (WHERE status IN ('scheduled', 'confirmed', 'completed')) as agendadas,
        COUNT(*) FILTER (WHERE status = 'completed') as realizadas
       FROM pacientes.appointments
       WHERE clinic_id = $1
       AND start_time >= TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'YYYY-MM-DD')
       AND start_time < TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
       GROUP BY DATE(start_time::timestamp), TO_CHAR(start_time::timestamp, 'Dy')
       ORDER BY DATE(start_time::timestamp)`,
      [clinicId],
    );

    return result.rows.map((row) => ({
      name: row.name,
      agendadas: parseInt(row.agendadas),
      realizadas: parseInt(row.realizadas),
    }));
  }

  private async getRevenueData(clinicId: string) {
    // Receitas e despesas dos últimos 6 meses — financial_transactions
    const result = await this.db.query(
      `SELECT
        TO_CHAR(transaction_date::date, 'Mon') as name,
        SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE 0 END) as receita,
        SUM(CASE WHEN type = 'DESPESA' THEN amount ELSE 0 END) as despesas
       FROM financeiro.financial_transactions
       WHERE clinic_id = $1
       AND transaction_date >= TO_CHAR(CURRENT_DATE - INTERVAL '6 months', 'YYYY-MM-DD')
       GROUP BY DATE_TRUNC('month', transaction_date::date), TO_CHAR(transaction_date::date, 'Mon')
       ORDER BY DATE_TRUNC('month', transaction_date::date)`,
      [clinicId],
    );

    return result.rows.map((row) => ({
      name: row.name,
      receita: parseFloat(row.receita),
      despesas: parseFloat(row.despesas),
    }));
  }

  private async getTreatmentsByStatus(_clinicId: string) {
    // Tratamentos por status (pep_tratamentos has no clinic_id)
    const result = await this.db.query(
      `SELECT
        status as name,
        COUNT(*) as value
       FROM pep.pep_tratamentos
       GROUP BY status
       ORDER BY value DESC`,
      [],
    );

    const statusLabels: Record<string, string> = {
      CONCLUIDO: "Concluído",
      EM_ANDAMENTO: "Em Andamento",
      PLANEJADO: "Planejado",
      CANCELADO: "Cancelado",
    };

    return result.rows.map((row) => ({
      name: statusLabels[row.name] || row.name,
      value: parseInt(row.value),
    }));
  }
}
