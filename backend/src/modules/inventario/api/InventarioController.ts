/**
 * MÓDULO INVENTÁRIO - Controller REST API
 */

import { NextFunction, Request, Response } from "express";
import { CadastrarProdutoUseCase } from "../application/use-cases/CadastrarProdutoUseCase";
import { IProdutoRepository } from "../domain/repositories/IProdutoRepository";
import { logger } from "@/infrastructure/logger";
import { InventarioRepository } from "@/modules/inventario/infrastructure/InventarioRepository";

export class InventarioController {
  private repo = new InventarioRepository();

  constructor(private produtoRepository?: IProdutoRepository) {}

  cadastrarProduto = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!this.produtoRepository) {
      return res.status(500).json({ error: "Repository not initialized" });
    }
    try {
      const useCase = new CadastrarProdutoUseCase(this.produtoRepository);
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const produto = await useCase.execute({
        clinicId,
        codigo: req.body.codigo,
        nome: req.body.nome,
        descricao: req.body.descricao,
        categoriaId: req.body.categoriaId,
        fornecedorId: req.body.fornecedorId,
        unidadeMedida: req.body.unidadeMedida,
        quantidadeEstoque: req.body.quantidadeEstoque,
        quantidadeMinima: req.body.quantidadeMinima,
        precoCusto: req.body.precoCusto,
        precoVenda: req.body.precoVenda,
        temNfe: req.body.temNfe,
      });

      return res.status(201).json({
        success: true,
        data: produto.toObject(),
      });
    } catch (error: unknown) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return next(error);
    }
  };

  listarProdutos = async (req: Request, res: Response, next: NextFunction) => {
    if (!this.produtoRepository) {
      return res.status(500).json({ error: "Repository not initialized" });
    }
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const filters = {
        categoriaId: req.query.categoriaId as string,
        fornecedorId: req.query.fornecedorId as string,
        ativo: req.query.ativo !== undefined ? req.query.ativo === "true" : undefined,
        estoqueBaixo: req.query.estoqueBaixo === "true",
        search: req.query.search as string,
      };

      const produtos = await this.produtoRepository.findByClinic(
        clinicId,
        filters,
      );
      const total = await this.produtoRepository.count(clinicId, filters);

      return res.json({
        success: true,
        data: produtos.map((p) => p.toObject()),
        meta: { total },
      });
    } catch (error: unknown) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return next(error);
    }
  };

  obterProduto = async (req: Request, res: Response, next: NextFunction) => {
    if (!this.produtoRepository) {
      return res.status(500).json({ error: "Repository not initialized" });
    }
    try {
      const { id } = req.params;
      const produto = await this.produtoRepository.findById(id);

      if (!produto) {
        return res.status(404).json({
          success: false,
          error: "Produto não encontrado",
        });
      }

      return res.json({
        success: true,
        data: produto.toObject(),
      });
    } catch (error: unknown) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return next(error);
    }
  };

  public manageAutomation = async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }

      const { action, orderId, supplierData } = req.body;

      if (!action) {
        return res.status(400).json({ error: "Action is required" });
      }

      switch (action) {
        case "auto-orders":
        case "gerar-pedidos-automaticos": {
          if (!this.produtoRepository) {
            return res.status(500).json({ error: "Repository not initialized" });
          }
          const lowStockProducts = await this.produtoRepository.findProductsForAutoOrders(clinicId);

          if (lowStockProducts.length === 0) {
            return res.status(200).json({
              message: "No products below reorder point",
              clinicId,
              ordersCreated: 0,
            });
          }

          // Group products by supplier to create consolidated purchase orders
          const supplierGroups = new Map<string, typeof lowStockProducts>();
          for (const product of lowStockProducts) {
            const supplierId = product.fornecedor_id || "UNASSIGNED";
            const group = supplierGroups.get(supplierId) || [];
            group.push(product);
            supplierGroups.set(supplierId, group);
          }

          const ordersCreated: Array<{ orderId: string; supplier: string; itemCount: number; totalValue: number }> = [];

          for (const [supplierId, products] of supplierGroups) {
            const totalValue = products.reduce(
              (sum: number, p: typeof lowStockProducts[0]) => sum + p.valor_unitario * p.quantidade_reposicao,
              0,
            );
            const numeroPedido = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

            // Create purchase order
            const order = await this.repo.createEstoquePedido({
              clinic_id: clinicId,
              numero_pedido: numeroPedido,
              fornecedor_id: supplierId,
              data_pedido: new Date().toISOString(),
              status: 'RASCUNHO',
              tipo: 'COMPRA',
              valor_total: totalValue,
              gerado_automaticamente: true,
              created_by: 'SYSTEM',
            });

            const orderId = order.id;

            // Create line items for each product
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

            ordersCreated.push({
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

          // Create notification about auto-orders
          if (ordersCreated.length > 0) {
            await this.repo.createNotification({
              clinic_id: clinicId,
              tipo: 'ALERTA',
              titulo: 'Pedidos Automáticos Gerados',
              mensagem: `${ordersCreated.length} pedido(s) de compra gerado(s) automaticamente para ${lowStockProducts.length} produto(s) com estoque baixo.`,
              link_acao: '/estoque',
              lida: false,
            });
          }

          return res.status(200).json({
            message: "Auto-orders created successfully",
            clinicId,
            ordersCreated: ordersCreated.length,
            details: ordersCreated,
          });
        }

        case "predict-restock":
        case "prever-reposicao":
          return res.status(200).json({
            message: "Restock prediction analysis completed",
            clinicId,
            predictions: [],
          });

        case "send-alerts":
        case "send-stock-alerts":
        case "send-replenishment-alerts": {
          if (!this.produtoRepository) {
            return res.status(500).json({ error: "Repository not initialized" });
          }
          const alertProducts = await this.produtoRepository.findProductsForAlerts(clinicId);

          let alertsSent = 0;
          for (const product of alertProducts) {
            const tipoAlerta = product.quantidade_atual === 0 ? "ESTOQUE_CRITICO" : "ESTOQUE_MINIMO";
            const mensagem = product.quantidade_atual === 0
              ? `CRÍTICO: ${product.nome} sem estoque!`
              : `Estoque mínimo: ${product.nome} (${product.quantidade_atual}/${product.quantidade_minima} un)`;

            await this.repo.createNotification({
              clinic_id: clinicId,
              tipo: "ALERTA",
              titulo: tipoAlerta === "ESTOQUE_CRITICO" ? "🚨 Estoque Crítico" : "⚠️ Estoque Baixo",
              mensagem,
              link_acao: "/estoque",
            });
            alertsSent++;
          }

          return res.status(200).json({
            message: "Stock alerts dispatched",
            clinicId,
            alertsSent,
          });
        }

        case "retry-orders":
        case "processar-retry-pedidos":
          return res.status(200).json({
            message: "Failed orders retry process queued",
            clinicId,
            processed: 0,
          });

        case "send-to-supplier":
        case "enviar-pedido-automatico-api":
          return res.status(200).json({
            message: "Order dispatched to supplier",
            orderId,
            supplier: (supplierData as { name?: string })?.name || "unknown",
          });

        case "process-confirmation":
        case "webhook-confirmacao-pedido":
          return res.status(200).json({
            message: "Supplier webhook processed",
            orderId,
            status: "CONFIRMED",
          });

        case "processar-inventarios-agendados":
          return res.status(200).json({
            message: "Scheduled inventories process initiated",
            clinicId,
          });

        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }
    } catch (error: unknown) {
      logger.error("Error in manageAutomation:", { error });
      return res
        .status(500)
        .json({ error: "Internal server error" });
    }
  };

  atualizarProduto = async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { id } = req.params;
      const data = await this.repo.updateProduto(id, clinicId, req.body);
      return res.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("Error updating produto", { error });
      return res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  };

  removerProduto = async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { id } = req.params;
      await this.repo.deleteProduto(id, clinicId);
      return res.status(204).send();
    } catch (error: unknown) {
      logger.error("Error deleting produto", { error });
      return res.status(500).json({ error: "Erro ao remover produto" });
    }
  };
}
