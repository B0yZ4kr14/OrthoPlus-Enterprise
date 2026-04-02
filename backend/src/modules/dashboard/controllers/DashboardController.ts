/**
 * Dashboard Controller - Fornece dados agregados para o Dashboard
 */

import { Request, Response } from 'express';
import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { logger } from '@/infrastructure/logger';

export class DashboardController {
  constructor(private db: IDatabaseConnection) {}

  /**
   * GET /api/dashboard/overview
   * Retorna dados consolidados do dashboard
   */
  async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(400).json({ error: 'Clinic ID is required' });
        return;
      }

      // Buscar estatísticas agregadas em paralelo
      const [stats, appointmentsData, revenueData, treatmentsByStatus] =
        await Promise.all([
          this.getStats(clinicId),
          this.getAppointmentsData(clinicId),
          this.getRevenueData(clinicId),
          this.getTreatmentsByStatus(clinicId),
        ]);

      res.json({
        stats,
        appointmentsData,
        revenueData,
        treatmentsByStatus,
      });
    } catch (error) {
      logger.error('[DashboardController] Error fetching overview:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }

  private async getStats(clinicId: string) {
    const publicDb = this.db;
    const today = new Date().toISOString().split('T')[0];

    // Executar todas as queries de estatísticas em paralelo
    const [
      totalPatientsResult,
      todayAppointmentsResult,
      monthlyRevenueResult,
      occupancyResult,
      pendingTreatmentsResult,
      completedTreatmentsResult,
    ] = await Promise.all([
      // Total de pacientes
      publicDb.query(
        'SELECT COUNT(*) as count FROM public.patients WHERE clinic_id = $1',
        [clinicId]
      ),
      // Consultas de hoje
      publicDb.query(
        `SELECT COUNT(*) as count FROM public.appointments 
         WHERE clinic_id = $1 AND DATE(start_time) = $2`,
        [clinicId, today]
      ),
      // Receita mensal (últimos 30 dias)
      publicDb.query(
        `SELECT COALESCE(SUM(valor), 0) as total 
         FROM financeiro.transacoes 
         WHERE clinic_id = $1 
         AND tipo = 'RECEITA' 
         AND data >= CURRENT_DATE - INTERVAL '30 days'`,
        [clinicId]
      ),
      // Taxa de ocupação (consultas realizadas vs agendadas esta semana)
      publicDb.query(
        `SELECT 
          COUNT(*) FILTER (WHERE status IN ('completed', 'confirmed')) as completed,
          COUNT(*) as total
         FROM public.appointments 
         WHERE clinic_id = $1 
         AND start_time >= DATE_TRUNC('week', CURRENT_DATE)
         AND start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'`,
        [clinicId]
      ),
      // Tratamentos pendentes
      publicDb.query(
        `SELECT COUNT(*) as count FROM pep.tratamentos 
         WHERE clinic_id = $1 AND status = 'em_andamento'`,
        [clinicId]
      ),
      // Tratamentos concluídos (últimos 30 dias)
      publicDb.query(
        `SELECT COUNT(*) as count FROM pep.tratamentos 
         WHERE clinic_id = $1 
         AND status = 'concluido' 
         AND updated_at >= CURRENT_DATE - INTERVAL '30 days'`,
        [clinicId]
      ),
    ]);

    const totalPatients = parseInt(totalPatientsResult.rows[0]?.count || '0');
    const todayAppointments = parseInt(todayAppointmentsResult.rows[0]?.count || '0');
    const monthlyRevenue = parseFloat(monthlyRevenueResult.rows[0]?.total || '0');
    const occupancyRate = occupancyResult.rows[0]?.total > 0
      ? Math.round((occupancyResult.rows[0].completed / occupancyResult.rows[0].total) * 100)
      : 0;
    const pendingTreatments = parseInt(pendingTreatmentsResult.rows[0]?.count || '0');
    const completedTreatments = parseInt(completedTreatmentsResult.rows[0]?.count || '0');

    return {
      totalPatients,
      todayAppointments,
      monthlyRevenue,
      occupancyRate,
      pendingTreatments,
      completedTreatments,
    };
  }

  private async getAppointmentsData(clinicId: string) {
    // Consultas da última semana (agendadas vs realizadas por dia)
    const result = await this.db.query(
      `SELECT 
        TO_CHAR(start_time, 'Dy') as name,
        COUNT(*) FILTER (WHERE status IN ('scheduled', 'confirmed', 'completed')) as agendadas,
        COUNT(*) FILTER (WHERE status = 'completed') as realizadas
       FROM public.appointments 
       WHERE clinic_id = $1 
       AND start_time >= CURRENT_DATE - INTERVAL '7 days'
       AND start_time < CURRENT_DATE
       GROUP BY DATE(start_time), TO_CHAR(start_time, 'Dy')
       ORDER BY DATE(start_time)`,
      [clinicId]
    );

    return result.rows.map(row => ({
      name: row.name,
      agendadas: parseInt(row.agendadas),
      realizadas: parseInt(row.realizadas),
    }));
  }

  private async getRevenueData(clinicId: string) {
    // Receitas e despesas dos últimos 6 meses
    const result = await this.db.query(
      `SELECT 
        TO_CHAR(data, 'Mon') as name,
        SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END) as receita,
        SUM(CASE WHEN tipo = 'DESPESA' THEN valor ELSE 0 END) as despesas
       FROM financeiro.transacoes 
       WHERE clinic_id = $1 
       AND data >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', data), TO_CHAR(data, 'Mon')
       ORDER BY DATE_TRUNC('month', data)`,
      [clinicId]
    );

    return result.rows.map(row => ({
      name: row.name,
      receita: parseFloat(row.receita),
      despesas: parseFloat(row.despesas),
    }));
  }

  private async getTreatmentsByStatus(clinicId: string) {
    // Tratamentos por status
    const result = await this.db.query(
      `SELECT 
        status as name,
        COUNT(*) as value
       FROM pep.tratamentos 
       WHERE clinic_id = $1
       GROUP BY status
       ORDER BY value DESC`,
      [clinicId]
    );

    const statusLabels: Record<string, string> = {
      concluido: 'Concluído',
      em_andamento: 'Em Andamento',
      pendente: 'Pendente',
      cancelado: 'Cancelado',
    };

    return result.rows.map(row => ({
      name: statusLabels[row.name] || row.name,
      value: parseInt(row.value),
    }));
  }
}
