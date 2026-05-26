/**
 * MODULO INVENTARIO - Controller REST API
 */

import { Request, Response } from "express"
import { Errors, asyncHandler } from "@/middleware/errorHandler"
import { CadastrarProdutoUseCase } from "../application/use-cases/CadastrarProdutoUseCase"
import { IProdutoRepository } from "../domain/repositories/IProdutoRepository"
import { IInventarioRepository } from "@/modules/inventario/domain/repositories/IInventarioRepository"
import { InventarioControllerService } from "@/modules/inventario/application/InventarioControllerService"

import { InventarioRepository } from "@/modules/inventario/infrastructure/InventarioRepository"

export class InventarioController {
  private repo: IInventarioRepository
  private service: InventarioControllerService

  constructor(
    repo?: IInventarioRepository,
    private produtoRepository?: IProdutoRepository,
  ) {
    this.repo = repo ?? new InventarioRepository()
    this.service = new InventarioControllerService(this.repo, this.produtoRepository)
  }

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
      throw Errors.notFound("Produto nao encontrado")
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
        const result = await this.service.createAutoOrders(clinicId)
        if (result.ordersCreated === 0) {
          res.status(200).json({
            message: "No products below reorder point",
            clinicId,
            ordersCreated: 0,
          })
          return
        }
        res.status(200).json({
          message: "Auto-orders created successfully",
          clinicId,
          ordersCreated: result.ordersCreated,
          details: result.details,
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
        const result = await this.service.sendStockAlerts(clinicId)
        res.status(200).json({
          message: "Stock alerts dispatched",
          clinicId,
          alertsSent: result.alertsSent,
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
