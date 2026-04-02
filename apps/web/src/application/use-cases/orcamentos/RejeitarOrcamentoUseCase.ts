import { Orcamento } from "@/domain/entities/Orcamento";
import { IOrcamentoRepository } from "@/domain/repositories/IOrcamentoRepository";

export interface RejeitarOrcamentoInput {
  orcamentoId: string;
  rejeitadoPor: string;
  motivo: string;
}

export interface RejeitarOrcamentoOutput {
  orcamento: Orcamento;
}

/**
 * Use Case: Rejeitar Orçamento
 *
 * Rejeita um orçamento que está PENDENTE.
 * Apenas orçamentos PENDENTES podem ser rejeitados.
 */
export class RejeitarOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

  async execute(
    input: RejeitarOrcamentoInput,
  ): Promise<RejeitarOrcamentoOutput> {
    // Buscar orçamento existente
    const orcamento = await this.orcamentoRepository.findById(
      input.orcamentoId,
    );

    if (!orcamento) {
      throw new Error("Orçamento não encontrado");
    }

    // Rejeitar (validações de domínio são aplicadas pela entidade)
    orcamento.rejeitar(input.rejeitadoPor, input.motivo);

    // Persistir mudanças
    await this.orcamentoRepository.update(orcamento);

    return { orcamento };
  }
}
