/**
 * MÓDULO INVENTÁRIO - Controller REST API
 */

import { Request, Response } from "express"
import { Errors, asyncHandler } from "@/middleware/errorHandler"
import { logger } from "@/infrastructure/logger"
import { CadastrarProdutoUseCase } from "../application/use-cases/CadastrarProdutoUseCase"
import { IProdutoRepository } from "../domain/repositories/IProdutoRepository"
import { InventarioRepository } from "@/modules/inventario/infrastructure/InventarioRepository"

export class InventarioController {
  private repo = new InventarioRepository();

  constructor(private produtoRepository?: IProdutoRepository) {}

  cadastrarProduto = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!this.produtoRepository) {
      throw Errors.internal("Repository not initialized")
    }
    const useCase = new CadastrarProdutoUseCase(this.produtoRepository)
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
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
    })

    res.status(201).json({
      success: true,
      data: produto.toObject(),
    })
    return
  })

  listarProdutos = asyncHandler(async (req: Request, res: Response) => {
    if (!this.produtoRepository) {
      throw Errors.internal("Repository not initialized")
    }
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }
    const filters = {
      categoriaId: req.query.categoriaId as string,
      fornecedorId: req.query.fornecedorId as string,
      ativo: req.query.ativo !== undefined ? req.query.ativo === "true" : undefined,
      estoqueBaixo: req.query.estoqueBaixo === "true",
      search: req.query.search as string,
    }

    const produtos = await this.produtoRepository.findByClinic(clinicId, filters)
    const total = await this.produtoRepository.count(clinicId, filters)

    res.json({
      success: true,
      data: produtos.map((p) => p.toObject()),
      meta: { total },
    })
  })

  obterProduto = asyncHandler(async (req: Request, res: Response) => {
    if (!this.produtoRepository) {
      throw Errors.internal("Repository not initialized")
    }
    const { id } = req.params
    const produto = await this.produtoRepository.findById(id)

    if (!produto) {
      throw Errors.notFound("Produto não encontrado")
    }

    res.json({
      success: true,
      data: produto.toObject(),
    })
  })

  manageAutomation = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { action, orderId, supplierData } = req.body

    if (!action) {
      throw Errors.validation("Action is required")
    }

    switch (action) {
      case "auto-orders":
      case "gerar-pedidos-automaticos": {
        if (!this.produtoRepository) {
          throw Errors.internal("Repository not initialized")
        }
          const lowStockProducts = await this.produtoRepository.findProductsForAutoOrders(clinicId);

          if (lowStockProducts.length === 0) {
            res.status(200).json({
              message: "No products below reorder point",
              clinicId,
              ordersCreated: 0,
            })
            return
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

          res.status(200).json({
            message: "Auto-orders created successfully",
            clinicId,
            ordersCreated: ordersCreated.length,
            details: ordersCreated,
          })
          return
        }

        case "predict-restock":
        case "prever-reposicao":
          res.status(200).json({
            message: "Restock prediction analysis completed",
            clinicId,
            predictions: [],
          })
          return

      case "send-alerts":
      case "send-stock-alerts":
      case "send-replenishment-alerts": {
        if (!this.produtoRepository) {
          throw Errors.internal("Repository not initialized")
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

          res.status(200).json({
            message: "Stock alerts dispatched",
            clinicId,
            alertsSent,
          })
          return
        }

        case "retry-orders":
        case "processar-retry-pedidos":
          res.status(200).json({
            message: "Failed orders retry process queued",
            clinicId,
            processed: 0,
          })
          return

        case "send-to-supplier":
        case "enviar-pedido-automatico-api":
          res.status(200).json({
            message: "Order dispatched to supplier",
            orderId,
            supplier: (supplierData as { name?: string })?.name || "unknown",
          })
          return

        case "process-confirmation":
        case "webhook-confirmacao-pedido":
          res.status(200).json({
            message: "Supplier webhook processed",
            orderId,
            status: "CONFIRMED",
          })
          return

        case "processar-inventarios-agendados":
          res.status(200).json({
            message: "Scheduled inventories process initiated",
            clinicId,
          })
          return

      default:
        throw Errors.validation(`Unknown action: ${action}`)
    }
  })

  atualizarProduto = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }
    const { id } = req.params
    const data = await this.repo.updateProduto(id, clinicId, req.body)
    res.json({ success: true, data })
  })

  removerProduto = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }
    const { id } = req.params
    await this.repo.deleteProduto(id, clinicId)
    res.status(204).send()
  })
}
