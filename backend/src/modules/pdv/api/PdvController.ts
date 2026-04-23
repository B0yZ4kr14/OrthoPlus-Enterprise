import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler, Errors } from "@/middleware/errorHandler";

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
  createVenda = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    createVendaSchema.parse(req.body);
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }

    const valorTotal = req.body.itens.reduce((acc: number, item: any) => 
      acc + (item.quantidade * item.valorUnitario) - item.valorDesconto, 0);

    const venda = await prisma.pdv_vendas.create({
      data: {
        clinic_id: clinicId,
        numero_venda: `VND-${Date.now()}`,
        valor_total: valorTotal,
        forma_pagamento: req.body.pagamentos[0]?.formaPagamento || 'DINHEIRO',
        status: 'CONCLUIDA',
        metadata: {
          vendedorId: req.body.vendedorId,
          itens: req.body.itens
        }
      }
    });

    logger.info("Venda created", { clinicId, vendaId: venda.id });
    res.status(201).json({ message: "Venda created successfully", venda });
  });

  listVendas = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }

    const vendas = await prisma.pdv_vendas.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: 'desc' },
      take: 50
    });

    logger.info("Listing vendas", { clinicId, count: vendas.length });
    res.status(200).json({ vendas });
  });

  getVendaById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }
    const { id } = req.params;
    const venda = await prisma.pdv_vendas.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!venda) {
      throw Errors.notFound("Venda");
    }
    res.json(venda);
  });

  cancelVenda = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }
    const { id } = req.params;
    const venda = await prisma.pdv_vendas.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!venda) {
      throw Errors.notFound("Venda");
    }
    if (venda.status === "CANCELADA") {
      throw Errors.validation("Venda already cancelled");
    }
    const updated = await prisma.pdv_vendas.update({
      where: { id },
      data: { status: "CANCELADA" },
    });
    logger.info("Venda cancelled", { clinicId, vendaId: id });
    res.json(updated);
  });
}
