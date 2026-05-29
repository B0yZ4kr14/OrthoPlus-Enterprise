import { IPdvRepository } from "@/modules/pdv/domain/repositories/IPdvRepository";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler, Errors } from "@/middleware/errorHandler";

import { PdvRepository } from "@/modules/pdv/infrastructure/PdvRepository";
import { prisma } from "@/infrastructure/database/prismaClient";

const createVendaSchema = z.object({
  patientId: z.string().uuid().optional(),
  vendedorId: z.string().uuid(),
  itens: z.array(
    z.object({
      produtoId: z.string().uuid(),
      descricao: z.string(),
      quantidade: z.number().positive(),
      valorUnitario: z.number().positive(),
      valorDesconto: z.number().min(0).default(0),
    }),
  ),
  pagamentos: z.array(
    z.object({
      formaPagamento: z.enum([
        "DINHEIRO",
        "CREDITO",
        "DEBITO",
        "PIX",
        "CRYPTO",
      ]),
      valor: z.number().positive(),
      parcelas: z.number().int().positive().default(1),
    }),
  ),
});

export class PdvController {
  private repo: IPdvRepository;

  constructor(repo?: IPdvRepository) {
    this.repo = repo ?? new PdvRepository();
  }
  createVenda = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      createVendaSchema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        throw Errors.unauthorized("Clinic ID not found in token");
      }

      const valorTotal = req.body.itens.reduce(
        (acc: number, item: any) =>
          acc + item.quantidade * item.valorUnitario - item.valorDesconto,
        0,
      );

      // Check stock before sale
      const estoqueAlertas: Array<{
        produtoId: string;
        nome: string;
        estoqueAtual: number;
        quantidade: number;
      }> = [];
      for (const item of req.body.itens) {
        const produto = await prisma.pdv_produtos.findFirst({
          where: { id: item.produtoId, clinic_id: clinicId },
        });
        if (
          produto &&
          produto.controla_estoque &&
          produto.estoque_atual !== null &&
          produto.estoque_atual < item.quantidade
        ) {
          res.status(400).json({
            error: "Estoque insuficiente",
            produto: produto.descricao,
            estoqueAtual: produto.estoque_atual,
            quantidadeSolicitada: item.quantidade,
          });
          return;
        }
      }

      const venda = await this.repo.createVenda({
        clinic_id: clinicId,
        numero_venda: `VND-${Date.now()}`,
        valor_total: valorTotal,
        forma_pagamento: req.body.pagamentos[0]?.formaPagamento || "DINHEIRO",
        status: "CONCLUIDA",
        metadata: {
          vendedorId: req.body.vendedorId,
          itens: req.body.itens,
        } as any,
      });

      // Create sale items in dedicated table
      await prisma.pdv_venda_itens.createMany({
        data: req.body.itens.map((item: any) => ({
          venda_id: venda.id,
          produto_id: item.produtoId,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valorUnitario,
          valor_desconto: item.valorDesconto || 0,
          valor_total:
            item.quantidade * item.valorUnitario - (item.valorDesconto || 0),
          clinic_id: clinicId,
        })),
      });

      // Deduct stock
      for (const item of req.body.itens) {
        const produto = await prisma.pdv_produtos.findFirst({
          where: { id: item.produtoId, clinic_id: clinicId },
        });
        if (
          produto &&
          produto.controla_estoque &&
          produto.estoque_atual !== null
        ) {
          const novoEstoque = produto.estoque_atual - item.quantidade;
          await prisma.pdv_produtos.update({
            where: { id: item.produtoId },
            data: { estoque_atual: novoEstoque },
          });
          if (novoEstoque <= (produto.estoque_minimo || 0)) {
            estoqueAlertas.push({
              produtoId: item.produtoId,
              nome: produto.descricao,
              estoqueAtual: novoEstoque,
              quantidade: item.quantidade,
            });
          }
        }
      }

      logger.info("Venda created", {
        clinicId,
        vendaId: venda.id,
        estoqueAlertas: estoqueAlertas.length,
      });
      res
        .status(201)
        .json({ message: "Venda created successfully", venda, estoqueAlertas });
    },
  );

  listVendas = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        throw Errors.unauthorized("Clinic ID not found in token");
      }

      const vendas = await this.repo.findVendasByClinic(clinicId);

      logger.info("Listing vendas", { clinicId, count: vendas.length });
      res.status(200).json({ vendas });
    },
  );

  getVendaById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        throw Errors.unauthorized("Clinic ID not found in token");
      }
      const { id } = req.params;
      const venda = await this.repo.findVendaById(id, clinicId);
      if (!venda) {
        throw Errors.notFound("Venda");
      }
      res.json(venda);
    },
  );

  cancelVenda = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        throw Errors.unauthorized("Clinic ID not found in token");
      }
      const { id } = req.params;
      const venda = await this.repo.findVendaById(id, clinicId);
      if (!venda) {
        throw Errors.notFound("Venda");
      }
      if (venda.status === "CANCELADA") {
        throw Errors.validation("Venda already cancelled");
      }

      // Rollback stock for items in dedicated table
      const itens = await prisma.pdv_venda_itens.findMany({
        where: { venda_id: id, clinic_id: clinicId },
      });
      for (const item of itens) {
        const produto = await prisma.pdv_produtos.findFirst({
          where: { id: item.produto_id, clinic_id: clinicId },
        });
        if (
          produto &&
          produto.controla_estoque &&
          produto.estoque_atual !== null
        ) {
          await prisma.pdv_produtos.update({
            where: { id: item.produto_id },
            data: { estoque_atual: produto.estoque_atual + item.quantidade },
          });
        }
      }

      // Fallback: rollback stock from metadata for legacy sales
      if (
        itens.length === 0 &&
        venda.metadata &&
        typeof venda.metadata === "object"
      ) {
        const metadata = venda.metadata as Record<string, unknown>;
        const metadataItens = metadata.itens as
          | Array<{ produtoId: string; quantidade: number }>
          | undefined;
        if (metadataItens) {
          for (const item of metadataItens) {
            const produto = await prisma.pdv_produtos.findFirst({
              where: { id: item.produtoId, clinic_id: clinicId },
            });
            if (
              produto &&
              produto.controla_estoque &&
              produto.estoque_atual !== null
            ) {
              await prisma.pdv_produtos.update({
                where: { id: item.produtoId },
                data: {
                  estoque_atual: produto.estoque_atual + item.quantidade,
                },
              });
            }
          }
        }
      }

      const updated = await this.repo.updateVenda(id, { status: "CANCELADA" });
      logger.info("Venda cancelled", { clinicId, vendaId: id });
      res.json(updated);
    },
  );

  getEstoqueAlerta = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        throw Errors.unauthorized("Clinic ID not found in token");
      }
      const produtos = await prisma.pdv_produtos.findMany({
        where: {
          clinic_id: clinicId,
          controla_estoque: true,
          estoque_atual: { lte: prisma.pdv_produtos.fields.estoque_minimo },
        },
        orderBy: { estoque_atual: "asc" },
      });
      res.status(200).json({ produtos });
    },
  );
}
