import { ItemOrcamento } from "@/domain/entities/ItemOrcamento";
import { IOrcamentoRepository } from "@/domain/repositories/IOrcamentoRepository";
import { IItemOrcamentoRepository } from "@/domain/repositories/IItemOrcamentoRepository";

export interface AddItemOrcamentoInput {
  orcamentoId: string;
  procedimentoId?: string;
  descricao: string;
  denteRegiao?: string;
  quantidade: number;
  valorUnitario: number;
  descontoPercentual: number;
  descontoValor: number;
  ordem: number;
  observacoes?: string;
}

export interface AddItemOrcamentoOutput {
  item: ItemOrcamento;
}

/**
 * Use Case: Adicionar Item ao Orçamento
 *
 * Adiciona um novo item/procedimento a um orçamento em RASCUNHO.
 * Recalcula os valores totais do orçamento automaticamente.
 */
export class AddItemOrcamentoUseCase {
  constructor(
    private readonly orcamentoRepository: IOrcamentoRepository,
    private readonly itemOrcamentoRepository: IItemOrcamentoRepository,
  ) {}

  async execute(input: AddItemOrcamentoInput): Promise<AddItemOrcamentoOutput> {
    // Verificar se orçamento existe e está em RASCUNHO
    const orcamento = await this.orcamentoRepository.findById(
      input.orcamentoId,
    );

    if (!orcamento) {
      throw new Error("Orçamento não encontrado");
    }

    if (!orcamento.podeSerEditado()) {
      throw new Error(
        "Apenas orçamentos em RASCUNHO podem ter itens adicionados",
      );
    }

    // Criar entidade de item (aplica validações de domínio)
    const item = ItemOrcamento.create({
      orcamentoId: input.orcamentoId,
      procedimentoId: input.procedimentoId,
      descricao: input.descricao,
      denteRegiao: input.denteRegiao,
      quantidade: input.quantidade,
      valorUnitario: input.valorUnitario,
      descontoPercentual: input.descontoPercentual,
      descontoValor: input.descontoValor,
      ordem: input.ordem,
      observacoes: input.observacoes,
    });

    // Persistir item
    await this.itemOrcamentoRepository.save(item);

    // Buscar todos os itens do orçamento para recalcular totais
    const itens = await this.itemOrcamentoRepository.findByOrcamentoId(
      input.orcamentoId,
    );

    // Calcular novo subtotal
    const valorSubtotal = itens.reduce(
      (acc, item) => acc + item.getSubtotal(),
      0,
    );
    const descontoTotal = itens.reduce(
      (acc, item) => acc + item.descontoValor,
      0,
    );
    const descontoPercentual =
      valorSubtotal > 0 ? (descontoTotal / valorSubtotal) * 100 : 0;

    // Atualizar valores do orçamento
    orcamento.atualizarValores(
      valorSubtotal,
      descontoPercentual,
      descontoTotal,
    );
    await this.orcamentoRepository.update(orcamento);

    return { item };
  }
}
