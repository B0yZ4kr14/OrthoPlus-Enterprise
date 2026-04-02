import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";


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
  async createVenda(req: Request, res: Response): Promise<void> {
    try {
      createVendaSchema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found in token" });
        return;
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
    } catch (error) {
      logger.error("Error creating venda", { error });
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async listVendas(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found in token" });
        return;
      }

      const vendas = await prisma.pdv_vendas.findMany({
        where: { clinic_id: clinicId },
        orderBy: { created_at: 'desc' },
        take: 50
      });

      logger.info("Listing vendas", { clinicId, count: vendas.length });
      res.status(200).json({ vendas });
    } catch (error) {
      logger.error("Error listing vendas", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getVendaById(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found in token" });
        return;
      }
      const { id } = req.params;
      const venda = await prisma.pdv_vendas.findFirst({
        where: { id, clinic_id: clinicId },
      });
      if (!venda) {
        res.status(404).json({ error: "Venda not found" });
        return;
      }
      res.json(venda);
    } catch (error) {
      logger.error("Error getting venda", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async cancelVenda(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found in token" });
        return;
      }
      const { id } = req.params;
      const venda = await prisma.pdv_vendas.findFirst({
        where: { id, clinic_id: clinicId },
      });
      if (!venda) {
        res.status(404).json({ error: "Venda not found" });
        return;
      }
      if (venda.status === "CANCELADA") {
        res.status(422).json({ error: "Venda already cancelled" });
        return;
      }
      const updated = await prisma.pdv_vendas.update({
        where: { id },
        data: { status: "CANCELADA" },
      });
      logger.info("Venda cancelled", { clinicId, vendaId: id });
      res.json(updated);
    } catch (error) {
      logger.error("Error cancelling venda", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
