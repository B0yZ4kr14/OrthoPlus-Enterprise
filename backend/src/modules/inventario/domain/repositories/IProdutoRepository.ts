import { Produto } from "../entities/Produto";

export interface FindAllOptions {
  clinicId: string;
  categoria?: string;
  status?: string;
  searchTerm?: string;
  skip?: number;
  take?: number;
}

export interface IProdutoRepository {
  findById(id: string): Promise<Produto | null>;
  findByCodigo(codigo: string, clinicId: string): Promise<Produto | null>;
  findAll(
    options: FindAllOptions,
  ): Promise<{ items: Produto[]; total: number }>;
  findEstoqueBaixo(clinicId: string, limiteMinimo?: number): Promise<Produto[]>;
  save(produto: Produto): Promise<void>;
  update(produto: Produto): Promise<void>;
  delete(id: string): Promise<void>;
  findByClinic(
    clinicId: string,
    filters?: {
      categoriaId?: string;
      fornecedorId?: string;
      ativo?: boolean;
      estoqueBaixo?: boolean;
      search?: string;
    },
  ): Promise<Produto[]>;
  count(
    clinicId: string,
    filters?: {
      categoriaId?: string;
      fornecedorId?: string;
      ativo?: boolean;
      estoqueBaixo?: boolean;
      search?: string;
    },
  ): Promise<number>;
  findProductsForAutoOrders(clinicId: string): Promise<
    Array<{
      produto_id: string;
      produto_nome: string;
      quantidade_atual: number;
      quantidade_minima: number;
      quantidade_reposicao: number;
      ponto_pedido: number;
      dias_entrega_estimados: number | null;
      fornecedor_id: string | null;
      valor_unitario: number;
    }>
  >;
  findProductsForAlerts(clinicId: string): Promise<
    Array<{
      id: string;
      nome: string;
      quantidade_atual: number;
      quantidade_minima: number;
    }>
  >;
}
