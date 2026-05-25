import { FinanceiroRepository } from "@/modules/financeiro/infrastructure/FinanceiroRepository"

export interface CashFlowResult {
  totalReceitas: number
  totalDespesas: number
  saldo: number
}

/**
 * GetCashFlowUseCase — computes cash flow analytics for a clinic.
 */
export class GetCashFlowUseCase {
  private repo = new FinanceiroRepository()

  async execute(
    clinicId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CashFlowResult> {
    const [receitas, despesas] = await Promise.all([
      this.repo.aggregateTransactions(clinicId, "RECEITA", "PAGO", startDate, endDate),
      this.repo.aggregateTransactions(clinicId, "DESPESA", "PAGO", startDate, endDate),
    ])

    return {
      totalReceitas: receitas._sum.amount || 0,
      totalDespesas: despesas._sum.amount || 0,
      saldo: (receitas._sum.amount || 0) - (despesas._sum.amount || 0),
    }
  }
}
