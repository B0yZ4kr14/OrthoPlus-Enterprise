import { apiClient } from "@/lib/api/apiClient";
import { ItemOrcamento } from "../../domain/entities/ItemOrcamento";
import { IItemOrcamentoRepository } from "../../domain/repositories/IItemOrcamentoRepository";

export class ItemOrcamentoRepositoryApi implements IItemOrcamentoRepository {
  async findById(id: string): Promise<ItemOrcamento | null> {
    try {
      const data: Record<string, any> = await apiClient.get(
        `/orcamentos/items/${id}`,
      );
      return this.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByBudgetId(budgetId: string): Promise<ItemOrcamento[]> {
    try {
      const data: Record<string, any> = await apiClient.get(
        `/orcamentos/${budgetId}/items`,
        {
          params: { sort: "ordem.asc" },
        },
      );
      return data.map((item: Record<string, any>) => this.toDomain(item));
    } catch {
      return [];
    }
  }

  async save(item: ItemOrcamento): Promise<void> {
    const data = this.toPersistence(item);
    await apiClient.post("/orcamentos/items", data);
  }

  async update(item: ItemOrcamento): Promise<void> {
    const data = this.toPersistence(item);
    await apiClient.put(`/orcamentos/items/${item.id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orcamentos/items/${id}`);
  }

  async deleteByBudgetId(budgetId: string): Promise<void> {
    await apiClient.delete(`/orcamentos/${budgetId}/items`);
  }

  private toDomain(data: Record<string, unknown>): ItemOrcamento {
    return ItemOrcamento.restore({
      id: String(data.id),
      budgetId: String(data.budget_id),
      ordem: Number(data.ordem),
      descricao: String(data.descricao),
      procedimentoId: data.procedimento_id
        ? String(data.procedimento_id)
        : undefined,
      denteRegiao: data.dente_regiao ? String(data.dente_regiao) : undefined,
      quantidade: Number(data.quantidade),
      valorUnitario: Number(data.valor_unitario),
      descontoPercentual: data.desconto_percentual
        ? Number(data.desconto_percentual)
        : undefined,
      descontoValor: data.desconto_valor
        ? Number(data.desconto_valor)
        : undefined,
      valorTotal: Number(data.valor_total),
      observacoes: data.observacoes ? String(data.observacoes) : undefined,
      createdAt: new Date(String(data.created_at)),
    });
  }

  private toPersistence(item: ItemOrcamento): unknown {
    return {
      id: item.id,
      budget_id: item.budgetId,
      ordem: item.ordem,
      descricao: item.descricao,
      procedimento_id: item.procedimentoId,
      dente_regiao: item.denteRegiao,
      quantidade: item.quantidade,
      valor_unitario: item.valorUnitario,
      desconto_percentual: item.descontoPercentual,
      desconto_valor: item.descontoValor,
      valor_total: item.valorTotal,
      observacoes: item.observacoes,
      created_at: item.createdAt.toISOString(),
    };
  }
}
