import { logger } from "@/infrastructure/logger"
import { IFinanceiroRepository } from "@/modules/financeiro/domain/repositories/IFinanceiroRepository"

export interface ResumoFinanceiroResult {
  saldoGeral: number
  totalReceitas: number
  totalDespesas: number
  contasReceber: {
    total: number
    quantidade: number
  }
  contasPagar: {
    total: number
    quantidade: number
  }
  caixasAbertos: number
}

/**
 * GetResumoFinanceiroUseCase — computes the financial summary for a clinic.
 */
export class GetResumoFinanceiroUseCase {
  private repo: IFinanceiroRepository

  constructor(repo?: IFinanceiroRepository) {
    this.repo = repo ?? new (require("@/modules/financeiro/infrastructure/FinanceiroRepository").FinanceiroRepository)()
  }

  async execute(clinicId: string): Promise<ResumoFinanceiroResult> {
    const [
      totalReceitas,
      totalDespesas,
      contasReceberPendentes,
      contasPagarPendentes,
    ] = await Promise.all([
      this.repo.aggregateTransactions(clinicId, "RECEITA", "PAGO"),
      this.repo.aggregateTransactions(clinicId, "DESPESA", "PAGO"),
      this.repo.aggregateContasReceber(clinicId),
      this.repo.aggregateContasPagar(clinicId),
    ])

    // Fallback for cash_registers table not existing (P2021)
    let caixasAbertos = 0
    try {
      caixasAbertos = await this.repo.countOpenCashRegisters(clinicId)
    } catch (cashError: any) {
      if (cashError.code === "P2021") {
        logger.warn("Tabela cash_registers não encontrada, retornando caixasAbertos=0", {
          clinicId,
          table: cashError.meta?.table,
        })
      } else {
        throw cashError
      }
    }

    return {
      saldoGeral: (totalReceitas._sum?.amount || 0) - (totalDespesas._sum?.amount || 0),
      totalReceitas: totalReceitas._sum?.amount || 0,
      totalDespesas: totalDespesas._sum?.amount || 0,
      contasReceber: {
        total: contasReceberPendentes._sum?.valor || 0,
        quantidade: (contasReceberPendentes._count as any)?.id || 0,
      },
      contasPagar: {
        total: contasPagarPendentes._sum?.valor || 0,
        quantidade: (contasPagarPendentes._count as any)?.id || 0,
      },
      caixasAbertos: caixasAbertos || 0,
    }
  }
}
