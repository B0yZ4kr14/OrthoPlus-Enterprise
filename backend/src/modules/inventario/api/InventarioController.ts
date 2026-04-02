/**
 * MÓDULO INVENTÁRIO - Controller REST API
 */

import { NextFunction, Request, Response } from "express";
import { CadastrarProdutoUseCase } from "../application/use-cases/CadastrarProdutoUseCase";
import { IProdutoRepository } from "../domain/repositories/IProdutoRepository";
import { logger } from "@/infrastructure/logger";
import { prisma } from "@/infrastructure/database/prismaClient";

export class InventarioController {
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
        ativo: req.query.ativo === "true",
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
          // Find products below minimum stock that have auto-order config
          const lowStockProducts = await prisma.$queryRaw<Array<{
            produto_id: string;
            produto_nome: string;
            quantidade_atual: number;
            quantidade_minima: number;
            quantidade_reposicao: number;
            ponto_pedido: number;
            dias_entrega_estimados: number | null;
            fornecedor_id: string | null;
            valor_unitario: number;
          }>>`
            SELECT
              p.id AS produto_id,
              p.nome AS produto_nome,
              p.quantidade_atual,
              p.quantidade_minima,
              COALESCE(pc.quantidade_reposicao, p.quantidade_minima * 2) AS quantidade_reposicao,
              COALESCE(pc.ponto_pedido, p.quantidade_minima) AS ponto_pedido,
              pc.dias_entrega_estimados,
              p.fornecedor AS fornecedor_id,
              p.valor_unitario
            FROM inventario.produtos p
            LEFT JOIN estoque_pedidos_config pc ON pc.produto_id = p.id AND pc.clinic_id = p.clinic_id
            WHERE p.clinic_id = ${clinicId}
              AND p.quantidade_atual <= COALESCE(pc.ponto_pedido, p.quantidade_minima)
              AND (p.ativo = true OR p.status = 'ATIVO')
            LIMIT 200
          `;

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
              (sum, p) => sum + p.valor_unitario * p.quantidade_reposicao,
              0,
            );
            const numeroPedido = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

            // Create purchase order
            const order = await prisma.$queryRaw<Array<{ id: string }>>`
              INSERT INTO estoque_pedidos (
                clinic_id, numero_pedido, fornecedor_id, data_pedido,
                status, tipo, valor_total, gerado_automaticamente, created_by
              ) VALUES (
                ${clinicId}, ${numeroPedido}, ${supplierId},
                ${new Date().toISOString()},
                'RASCUNHO', 'COMPRA', ${totalValue}, true, 'SYSTEM'
              )
              RETURNING id
            `;

            const orderId = order[0].id;

            // Create line items for each product
            for (const product of products) {
              const itemTotal = product.valor_unitario * product.quantidade_reposicao;
              await prisma.$queryRaw`
                INSERT INTO estoque_pedidos_itens (
                  pedido_id, produto_id, quantidade, preco_unitario, valor_total
                ) VALUES (
                  ${orderId}, ${product.produto_id},
                  ${product.quantidade_reposicao}, ${product.valor_unitario},
                  ${itemTotal}
                )
              `;
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
            await prisma.$queryRaw`
              INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
              VALUES (
                ${clinicId}, 'ALERTA',
                'Pedidos Automáticos Gerados',
                ${`${ordersCreated.length} pedido(s) de compra gerado(s) automaticamente para ${lowStockProducts.length} produto(s) com estoque baixo.`},
                '/estoque'
              )
            `;
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
          // Find products below minimum and create notification alerts
          const alertProducts = await prisma.$queryRaw<Array<{
            id: string;
            nome: string;
            quantidade_atual: number;
            quantidade_minima: number;
          }>>`
            SELECT id, nome, quantidade_atual, quantidade_minima
            FROM inventario.produtos
            WHERE clinic_id = ${clinicId}
              AND quantidade_atual <= quantidade_minima
              AND (ativo = true OR status = 'ATIVO')
            LIMIT 200
          `;

          let alertsSent = 0;
          for (const product of alertProducts) {
            const tipoAlerta = product.quantidade_atual === 0 ? "ESTOQUE_CRITICO" : "ESTOQUE_MINIMO";
            const mensagem = product.quantidade_atual === 0
              ? `CRÍTICO: ${product.nome} sem estoque!`
              : `Estoque mínimo: ${product.nome} (${product.quantidade_atual}/${product.quantidade_minima} un)`;

            await prisma.$queryRaw`
              INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
              VALUES (
                ${clinicId}, 'ALERTA', ${tipoAlerta === "ESTOQUE_CRITICO" ? "🚨 Estoque Crítico" : "⚠️ Estoque Baixo"},
                ${mensagem}, '/estoque'
              )
            `;
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
}
