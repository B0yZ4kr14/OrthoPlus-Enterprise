import { apiClient } from "@/lib/api/apiClient";
import { ItemOrcamento } from "../../domain/entities/ItemOrcamento";
import { IItemOrcamentoRepository } from "../../domain/repositories/IItemOrcamentoRepository";

export class ItemOrcamentoRepositoryApi implements IItemOrcamentoRepository {
  async findById(id: string): Promise<ItemOrcamento | null> {
    try {
      const data: Record<string, any> = await apiClient.get(`/orcamentos/items/${id}`);
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

  private toDomain(data: unknown): ItemOrcamento {
    return ItemOrcamento.restore({
      // @ts-expect-error — TS18046
      id: data.id,
      // @ts-expect-error — TS18046
      budgetId: data.budget_id,
      // @ts-expect-error — TS18046
      ordem: data.ordem,
      // @ts-expect-error — TS18046
      descricao: data.descricao,
      // @ts-expect-error — TS18046
      procedimentoId: data.procedimento_id,
      // @ts-expect-error — TS18046
      denteRegiao: data.dente_regiao,
      // @ts-expect-error — TS18046
      quantidade: data.quantidade,
      // @ts-expect-error — TS18046
      valorUnitario: data.valor_unitario,
      // @ts-expect-error — TS18046
      descontoPercentual: data.desconto_percentual,
      // @ts-expect-error — TS18046
      descontoValor: data.desconto_valor,
      // @ts-expect-error — TS18046
      valorTotal: data.valor_total,
      // @ts-expect-error — TS18046
      observacoes: data.observacoes,
      // @ts-expect-error — TS18046
      createdAt: new Date(data.created_at),
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
