import { Orcamento } from "@/domain/entities/Orcamento";
import { IOrcamentoRepository } from "@/domain/repositories/IOrcamentoRepository";
import { IItemOrcamentoRepository } from "@/domain/repositories/IItemOrcamentoRepository";

export interface CreateOrcamentoInput {
  clinicId: string;
  patientId: string;
  titulo: string;
  descricao?: string;
  tipoPagamento: "AVISTA" | "PARCELADO" | "CONVENIO";
  valorSubtotal: number;
  descontoPercentual: number;
  descontoValor: number;
  valorTotal: number;
  validadeDias: number;
  createdBy: string;
}

export interface CreateOrcamentoOutput {
  orcamento: Orcamento;
}

/**
 * Use Case: Criar Novo Orçamento
 *
 * Cria um novo orçamento em estado RASCUNHO.
 * Validações de domínio são aplicadas pela entidade.
 */
export class CreateOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

  async execute(input: CreateOrcamentoInput): Promise<CreateOrcamentoOutput> {
    // Criar entidade de orçamento (aplica validações de domínio)
    const orcamento = Orcamento.create({
      clinicId: input.clinicId,
      patientId: input.patientId,
      titulo: input.titulo,
      descricao: input.descricao,
      tipoPagamento: input.tipoPagamento,
      valorSubtotal: input.valorSubtotal,
      descontoPercentual: input.descontoPercentual,
      descontoValor: input.descontoValor,
      valorTotal: input.valorTotal,
      validadeDias: input.validadeDias,
      createdBy: input.createdBy,
    });

    // Persistir no repositório
    await this.orcamentoRepository.save(orcamento);

    return { orcamento };
  }
}
