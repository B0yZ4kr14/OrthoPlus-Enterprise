import { Prisma } from "@prisma/client";
import type { pdv_vendas } from "@prisma/client";

/**
 * IPdvRepository — interface for pdv module database access.
 * Decouples controllers from Prisma / infrastructure details.
 */
export interface IPdvRepository {
  createVenda(data: Prisma.pdv_vendasCreateInput): Promise<pdv_vendas>;
  findVendasByClinic(clinicId: string): Promise<pdv_vendas[]>;
  findVendaById(id: string, clinicId: string): Promise<pdv_vendas | null>;
  updateVenda(
    id: string,
    clinicId: string,
    data: Prisma.pdv_vendasUpdateInput,
  ): Promise<pdv_vendas>;

  findManyDashboard(where: Record<string, unknown>): Promise<unknown[]>;
  findManyMetas(clinicId: string): Promise<unknown[]>;

  // Produtos
  findProdutoById(id: string, clinicId: string): Promise<unknown | null>;
  updateProduto(id: string, clinicId: string, data: Record<string, unknown>): Promise<unknown>;
  findProdutosBaixoEstoque(clinicId: string): Promise<unknown[]>;

  // Venda Itens
  createVendaItens(data: unknown[]): Promise<unknown>;
  findVendaItens(vendaId: string, clinicId: string): Promise<unknown[]>;
}
