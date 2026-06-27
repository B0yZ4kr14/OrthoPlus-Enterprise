import { IFinanceiroRepository } from "@/modules/financeiro/domain/repositories/IFinanceiroRepository";

import { FinanceiroRepository } from "@/modules/financeiro/infrastructure/FinanceiroRepository";

export interface ProcessarPagamentoInput {
  contaReceberId: string;
  amount: number;
  paymentMethod: string;
  clinicId: string;
}

export interface ProcessarPagamentoResult {
  transactionId: string;
  status: string;
}

/**
 * ProcessarPagamentoUseCase — processes a payment for a receivable.
 * Updates conta_receber status and creates a payment transaction.
 */
export class ProcessarPagamentoUseCase {
  private repo: IFinanceiroRepository;

  constructor(repo?: IFinanceiroRepository) {
    this.repo = repo ?? new FinanceiroRepository();
  }

  async execute(
    input: ProcessarPagamentoInput,
  ): Promise<ProcessarPagamentoResult> {
    const transactionId = `txn_${Date.now()}`;

    await this.repo.processarPagamento(
      input.contaReceberId,
      input.clinicId,
      {
        status: "PAGO",
        data_pagamento: new Date().toISOString(),
        forma_pagamento: input.paymentMethod,
      },
      {
        valor: input.amount,
        metodo_pagamento: input.paymentMethod,
        status: "APROVADO",
        gateway_transaction_id: transactionId,
        observacoes: `Processado via API backend`,
      },
    );

    return { transactionId, status: "APPROVED" };
  }
}
