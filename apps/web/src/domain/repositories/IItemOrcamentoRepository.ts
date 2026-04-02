import { ItemOrcamento } from "../entities/ItemOrcamento";

/**
 * Interface do repositório de itens de orçamento
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IItemOrcamentoRepository {
  /**
   * Busca um item por ID
   */
  findById(id: string): Promise<ItemOrcamento | null>;

  /**
   * Busca todos os itens de um orçamento
   */
  findByOrcamentoId(orcamentoId: string): Promise<ItemOrcamento[]>;

  /**
   * Salva um novo item
   */
  save(item: ItemOrcamento): Promise<void>;

  /**
   * Atualiza um item existente
   */
  update(item: ItemOrcamento): Promise<void>;

  /**
   * Remove um item
   */
  delete(id: string): Promise<void>;

  /**
   * Remove todos os itens de um orçamento
   */
  deleteByOrcamentoId(orcamentoId: string): Promise<void>;
}
