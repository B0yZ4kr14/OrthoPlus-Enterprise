import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";
import { IInventarioRepository } from "@/modules/inventario/domain/repositories/IInventarioRepository";

export class InventarioRepository implements IInventarioRepository {
  async updateProduto(
    id: string,
    clinicId: string,
    data: Prisma.produtosUpdateManyMutationInput,
  ) {
    return prisma.produtos.updateMany({
      where: { id, clinic_id: clinicId },
      data,
    });
  }

  async deleteProduto(id: string, clinicId: string) {
    return prisma.produtos.deleteMany({ where: { id, clinic_id: clinicId } });
  }

  async createEstoquePedido(data: Prisma.estoque_pedidosCreateInput) {
    return prisma.estoque_pedidos.create({ data });
  }

  async createEstoquePedidoItem(data: Prisma.estoque_pedidos_itensCreateInput) {
    return prisma.estoque_pedidos_itens.create({ data });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createNotification(data: Record<string, unknown>) {
    return prisma.notifications.create({ data: data as any });
  }
}
