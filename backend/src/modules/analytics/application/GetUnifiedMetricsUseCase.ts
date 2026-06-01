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
    const [receitaTotal, receitaMesAnterior, despesasTotal] =
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

    const crescimentoMes =
      receitaMesAnterior > 0
        ? ((receitaTotal - receitaMesAnterior) / receitaMesAnterior) * 100
        : 0;

    const lucroLiquido = receitaTotal - despesasTotal;
    const margemLucro =
      receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

    // Clinical Metrics
    const appointments = await this.repo.getAppointmentsForPeriod(
      clinicId,
      startOfMonth,
    );
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(
      (a) => a.status === "CONCLUIDA",
    ).length;
    const taxaOcupacao =
      totalAppointments > 0
        ? (completedAppointments / totalAppointments) * 100
        : 0;

    const durations = appointments
      .filter((a) => a.status === "CONCLUIDA" && a.end_time)
      .map(
        (a) =>
          new Date(a.end_time).getTime() - new Date(a.start_time).getTime(),
      );

    const tempoMedioConsulta = durations.length
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length / 60000
      : 0;

    // Financial Metrics
    const uniquePatients = await this.repo.getUniquePayingPatients(
      clinicId,
      startOfMonth,
    );
    const ticketMedio =
      uniquePatients > 0 ? receitaTotal / uniquePatients : 0;

    const receivables = await this.repo.getPendingReceivables(clinicId);
    const overdue = receivables.filter(
      (r) => r.data_vencimento && new Date(r.data_vencimento) < new Date(),
    ).length;
    const totalReceivables = receivables.length;
    const inadimplencia =
      totalReceivables > 0 ? (overdue / totalReceivables) * 100 : 0;
    const fluxoCaixa = lucroLiquido;

    // Commercial Metrics
    const [totalLeads, convertedLeads] = await Promise.all([
      this.repo.countLeads(clinicId, startOfMonth),
      this.repo.countConvertedLeads(clinicId, startOfMonth),
    ]);

    const conversaoLeads =
      totalLeads && convertedLeads
        ? (convertedLeads / totalLeads) * 100
        : 0;

    const custoMarketing = await this.repo.getMarketingExpenses(
      clinicId,
      startOfMonth,
    );
    const custoAquisicao = convertedLeads
      ? custoMarketing / convertedLeads
      : 0;

    const lifetimeValue = ticketMedio * 12;
    const roiMarketing =
      custoMarketing > 0
        ? ((lifetimeValue * convertedLeads - custoMarketing) /
            custoMarketing) *
          100
        : 0;

    return {
      executive: {
        receita_total: receitaTotal,
        crescimento_mes: crescimentoMes,
        lucro_liquido: lucroLiquido,
        margem_lucro: margemLucro,
      },
      clinical: {
        taxa_ocupacao: taxaOcupacao,
        tempo_medio_consulta: tempoMedioConsulta,
        satisfacao_pacientes: 85,
        procedimentos_realizados: completedAppointments,
      },
      financial: {
        ticket_medio: ticketMedio,
        recorrencia: 75,
        inadimplencia,
        fluxo_caixa: fluxoCaixa,
      },
      commercial: {
        conversao_leads: conversaoLeads,
        custo_aquisicao: custoAquisicao,
        lifetime_value: lifetimeValue,
        roi_marketing: roiMarketing,
      },
    };
  }
}
