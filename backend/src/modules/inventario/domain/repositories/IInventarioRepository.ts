import { Prisma } from "@prisma/client";
import type { estoque_pedidos, estoque_pedidos_itens } from "@prisma/client";

/**
 * IInventarioRepository — interface for inventario module database access.
 * Decouples controllers and services from Prisma / infrastructure details.
 */
export interface IInventarioRepository {
  updateProduto(
    id: string,
    clinicId: string,
    data: Prisma.produtosUpdateManyMutationInput,
  ): Promise<Prisma.BatchPayload>;

  deleteProduto(id: string, clinicId: string): Promise<Prisma.BatchPayload>;

  createEstoquePedido(
    data: Prisma.estoque_pedidosCreateInput,
  ): Promise<estoque_pedidos>;

  createEstoquePedidoItem(
    data: Prisma.estoque_pedidos_itensCreateInput,
  ): Promise<estoque_pedidos_itens>;

  createNotification(data: Record<string, unknown>): Promise<any>;
}
