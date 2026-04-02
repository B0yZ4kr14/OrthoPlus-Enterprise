import { Orcamento } from "@/domain/entities/Orcamento";
import { IOrcamentoRepository } from "@/domain/repositories/IOrcamentoRepository";

export interface UpdateOrcamentoInput {
  orcamentoId: string;
  valorSubtotal?: number;
  descontoPercentual?: number;
  descontoValor?: number;
  tipoPagamento?: "AVISTA" | "PARCELADO" | "CONVENIO";
}

export interface UpdateOrcamentoOutput {
  orcamento: Orcamento;
}

/**
 * Use Case: Atualizar Orçamento
 *
 * Atualiza valores de um orçamento em estado RASCUNHO.
 * Apenas orçamentos em RASCUNHO podem ser editados.
 */
export class UpdateOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

  async execute(input: UpdateOrcamentoInput): Promise<UpdateOrcamentoOutput> {
    // Buscar orçamento existente
    const orcamento = await this.orcamentoRepository.findById(
      input.orcamentoId,
    );

    if (!orcamento) {
      throw new Error("Orçamento não encontrado");
    }

    // Atualizar valores (validações de domínio são aplicadas pela entidade)
    if (
      input.valorSubtotal !== undefined &&
      input.descontoPercentual !== undefined &&
      input.descontoValor !== undefined
    ) {
      orcamento.atualizarValores(
        input.valorSubtotal,
        input.descontoPercentual,
        input.descontoValor,
      );
    }

    // Atualizar tipo de pagamento
    if (input.tipoPagamento) {
      orcamento.atualizarTipoPagamento(input.tipoPagamento);
    }

    // Persistir mudanças
    await this.orcamentoRepository.update(orcamento);

    return { orcamento };
  }
}
