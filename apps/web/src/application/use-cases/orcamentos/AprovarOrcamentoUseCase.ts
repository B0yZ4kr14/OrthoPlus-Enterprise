import { Orcamento } from "@/domain/entities/Orcamento";
import { IOrcamentoRepository } from "@/domain/repositories/IOrcamentoRepository";

export interface AprovarOrcamentoInput {
  orcamentoId: string;
  aprovadoPor: string;
}

export interface AprovarOrcamentoOutput {
  orcamento: Orcamento;
}

/**
 * Use Case: Aprovar Orçamento
 *
 * Aprova um orçamento que está PENDENTE.
 * Apenas orçamentos PENDENTES e não expirados podem ser aprovados.
 */
export class AprovarOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

  async execute(input: AprovarOrcamentoInput): Promise<AprovarOrcamentoOutput> {
    // Buscar orçamento existente
    const orcamento = await this.orcamentoRepository.findById(
      input.orcamentoId,
    );

    if (!orcamento) {
      throw new Error("Orçamento não encontrado");
    }

    // Aprovar (validações de domínio são aplicadas pela entidade)
    orcamento.aprovar(input.aprovadoPor);

    // Persistir mudanças
    await this.orcamentoRepository.update(orcamento);

    return { orcamento };
  }
}
