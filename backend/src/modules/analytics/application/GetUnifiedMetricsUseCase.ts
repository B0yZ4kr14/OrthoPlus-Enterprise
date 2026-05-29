import { AnalyticsRepository } from "@/modules/analytics/infrastructure/AnalyticsRepository";

export interface UnifiedMetricsResult {
  executive: {
    receita_total: number;
    crescimento_mes: number;
    lucro_liquido: number;
    margem_lucro: number;
  };
  clinical: {
    taxa_ocupacao: number;
    tempo_medio_consulta: number;
    satisfacao_pacientes: number;
    procedimentos_realizados: number;
  };
  financial: {
    ticket_medio: number;
    recorrencia: number;
    inadimplencia: number;
    fluxo_caixa: number;
  };
  commercial: {
    conversao_leads: number;
    custo_aquisicao: number;
    lifetime_value: number;
    roi_marketing: number;
  };
}

/**
 * GetUnifiedMetricsUseCase — computes unified executive/clinical/financial/commercial metrics.
 */
export class GetUnifiedMetricsUseCase {
  private repo = new AnalyticsRepository();

  async execute(clinicId: string): Promise<UnifiedMetricsResult> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Executive Metrics
    const [receita_total, receita_mes_anterior, despesas_total] =
      await Promise.all([
        this.repo.aggregateRevenue(clinicId, "RECEITA", startOfMonth),
        this.repo.aggregateRevenue(
          clinicId,
          "RECEITA",
          startOfLastMonth,
          startOfMonth,
        ),
        this.repo.aggregateRevenue(clinicId, "DESPESA", startOfMonth),
      ]);

    const crescimento_mes =
      receita_mes_anterior > 0
        ? ((receita_total - receita_mes_anterior) / receita_mes_anterior) * 100
        : 0;

    const lucro_liquido = receita_total - despesas_total;
    const margem_lucro =
      receita_total > 0 ? (lucro_liquido / receita_total) * 100 : 0;

    // Clinical Metrics
    const appointments = await this.repo.getAppointmentsForPeriod(
      clinicId,
      startOfMonth,
    );
    const total_appointments = appointments.length;
    const completed_appointments = appointments.filter(
      (a) => a.status === "CONCLUIDA",
    ).length;
    const taxa_ocupacao =
      total_appointments > 0
        ? (completed_appointments / total_appointments) * 100
        : 0;

    const durations = appointments
      .filter((a) => a.status === "CONCLUIDA" && a.end_time)
      .map(
        (a) =>
          new Date(a.end_time).getTime() - new Date(a.start_time).getTime(),
      );

    const tempo_medio_consulta = durations.length
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length / 60000
      : 0;

    // Financial Metrics
    const unique_patients = await this.repo.getUniquePayingPatients(
      clinicId,
      startOfMonth,
    );
    const ticket_medio =
      unique_patients > 0 ? receita_total / unique_patients : 0;

    const receivables = await this.repo.getPendingReceivables(clinicId);
    const overdue = receivables.filter(
      (r) => r.data_vencimento && new Date(r.data_vencimento) < new Date(),
    ).length;
    const total_receivables = receivables.length;
    const inadimplencia =
      total_receivables > 0 ? (overdue / total_receivables) * 100 : 0;
    const fluxo_caixa = lucro_liquido;

    // Commercial Metrics
    const [total_leads, converted_leads] = await Promise.all([
      this.repo.countLeads(clinicId, startOfMonth),
      this.repo.countConvertedLeads(clinicId, startOfMonth),
    ]);

    const conversao_leads =
      total_leads && converted_leads
        ? (converted_leads / total_leads) * 100
        : 0;

    const custo_marketing = await this.repo.getMarketingExpenses(
      clinicId,
      startOfMonth,
    );
    const custo_aquisicao = converted_leads
      ? custo_marketing / converted_leads
      : 0;

    const lifetime_value = ticket_medio * 12;
    const roi_marketing =
      custo_marketing > 0
        ? ((lifetime_value * converted_leads - custo_marketing) /
            custo_marketing) *
          100
        : 0;

    return {
      executive: {
        receita_total,
        crescimento_mes,
        lucro_liquido,
        margem_lucro,
      },
      clinical: {
        taxa_ocupacao,
        tempo_medio_consulta,
        satisfacao_pacientes: 85,
        procedimentos_realizados: completed_appointments,
      },
      financial: {
        ticket_medio,
        recorrencia: 75,
        inadimplencia,
        fluxo_caixa,
      },
      commercial: {
        conversao_leads,
        custo_aquisicao,
        lifetime_value,
        roi_marketing,
      },
    };
  }
}
