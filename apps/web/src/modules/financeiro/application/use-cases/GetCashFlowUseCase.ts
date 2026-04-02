import { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { Period } from "../../domain/valueObjects/Period";

export interface GetCashFlowDTO {
  clinicId: string;
  period: Period;
}

export interface CashFlowResult {
  period: Period;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPendentes: number;
  despesasPendentes: number;
}

export class GetCashFlowUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(dto: GetCashFlowDTO): Promise<CashFlowResult> {
    const [totalReceitas, totalDespesas] = await Promise.all([
      this.transactionRepository.getTotalByPeriod(
        dto.clinicId,
        dto.period,
        "RECEITA",
      ),
      this.transactionRepository.getTotalByPeriod(
        dto.clinicId,
        dto.period,
        "DESPESA",
      ),
    ]);

    const pendingTransactions =
      await this.transactionRepository.getPendingTransactions(dto.clinicId);

    const receitasPendentes = pendingTransactions
      .filter((t) => t.type === "RECEITA")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const despesasPendentes = pendingTransactions
      .filter((t) => t.type === "DESPESA")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    return {
      period: dto.period,
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      receitasPendentes,
      despesasPendentes,
    };
  }
}
