import { logger } from "@/infrastructure/logger";
import { InventarioRepository } from "@/modules/inventario/infrastructure/InventarioRepository";
import { IProdutoRepository } from "@/modules/inventario/domain/repositories/IProdutoRepository";

export interface AutoOrderDetail {
  orderId: string;
  supplier: string;
  itemCount: number;
  totalValue: number;
}

export class InventarioControllerService {
  constructor(
    private repo: InventarioRepository = new InventarioRepository(),
    private produtoRepository?: IProdutoRepository
  ) {}

  async createAutoOrders(clinicId: string): Promise<{
    ordersCreated: number;
    details: AutoOrderDetail[];
    lowStockCount: number;
  }> {
    if (!this.produtoRepository) {
      throw new Error("Repository not initialized");
    }

    const lowStockProducts = await this.produtoRepository.findProductsForAutoOrders(clinicId);

    if (lowStockProducts.length === 0) {
      return { ordersCreated: 0, details: [], lowStockCount: 0 };
    }

    const supplierGroups = new Map<string, typeof lowStockProducts>();
    for (const product of lowStockProducts) {
      const supplierId = product.fornecedor_id || "UNASSIGNED";
      const group = supplierGroups.get(supplierId) || [];
      group.push(product);
      supplierGroups.set(supplierId, group);
    }

    const details: AutoOrderDetail[] = [];

    for (const [supplierId, products] of supplierGroups) {
      const totalValue = products.reduce(
        (sum: number, p: typeof lowStockProducts[0]) => sum + p.valor_unitario * p.quantidade_reposicao,
        0,
      );
      const numeroPedido = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const order = await this.repo.createEstoquePedido({
        clinic_id: clinicId,
        numero_pedido: numeroPedido,
        fornecedor_id: supplierId,
        data_pedido: new Date().toISOString(),
        status: "RASCUNHO",
        tipo: "COMPRA",
        valor_total: totalValue,
        gerado_automaticamente: true,
        created_by: "SYSTEM",
      });

      const orderId = order.id;

      for (const product of products) {
        const itemTotal = product.valor_unitario * product.quantidade_reposicao;
        await this.repo.createEstoquePedidoItem({
          pedido_id: orderId,
          produto_id: product.produto_id,
          quantidade: product.quantidade_reposicao,
          preco_unitario: product.valor_unitario,
          valor_total: itemTotal,
        });
      }

      details.push({
        orderId,
        supplier: supplierId,
        itemCount: products.length,
        totalValue,
      });

      logger.info("Auto-order created", {
        clinicId,
        orderId,
        supplier: supplierId,
        items: products.length,
      });
    }

    if (details.length > 0) {
      await this.repo.createNotification({
        clinic_id: clinicId,
        tipo: "ALERTA",
        titulo: "Pedidos Automaticos Gerados",
        mensagem: `${details.length} pedido(s) de compra gerado(s) automaticamente para ${lowStockProducts.length} produto(s) com estoque baixo.`,
        link_acao: "/estoque",
        lida: false,
      });
    }

    return {
      ordersCreated: details.length,
      details,
      lowStockCount: lowStockProducts.length,
    };
  }

  async sendStockAlerts(clinicId: string): Promise<{ alertsSent: number }> {
    if (!this.produtoRepository) {
      throw new Error("Repository not initialized");
    }

    const alertProducts = await this.produtoRepository.findProductsForAlerts(clinicId);

    let alertsSent = 0;
    for (const product of alertProducts) {
      const tipoAlerta = product.quantidade_atual === 0 ? "ESTOQUE_CRITICO" : "ESTOQUE_MINIMO";
      const mensagem = product.quantidade_atual === 0
        ? `CRITICO: ${product.nome} sem estoque!`
        : `Estoque minimo: ${product.nome} (${product.quantidade_atual}/${product.quantidade_minima} un)`;

      await this.repo.createNotification({
        clinic_id: clinicId,
        tipo: "ALERTA",
        titulo: tipoAlerta === "ESTOQUE_CRITICO" ? "Estoque Critico" : "Estoque Baixo",
        mensagem,
        link_acao: "/estoque",
      });
      alertsSent++;
    }

    return { alertsSent };
  }
}
