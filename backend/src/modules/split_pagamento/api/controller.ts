import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import {
  upsertConfigSchema,
  createComissaoSchema,
  calculateSplitSchema,
} from "./schemas";

export class SplitPagamentoController {
  // --- Configuração de split ---
  async getConfig(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const data = await prisma.split_payment_config.findMany({
      where: { clinic_id: clinicId },
    });
    return res.json(data);
  }

  async upsertConfig(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const parsed = upsertConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const existing = await prisma.split_payment_config.findFirst({
      where: { clinic_id: clinicId },
    });
    let data;
    if (existing) {
      data = await prisma.split_payment_config.update({
        where: { id: existing.id },
        data: parsed.data,
      });
    } else {
      data = await prisma.split_payment_config.create({
        data: {
          ...parsed.data,
          clinic_id: clinicId,
          is_active: parsed.data.is_active ?? true,
        },
      });
    }
    return res.json(data);
  }

  // --- Comissões ---
  async listComissoes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { professional_id } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (professional_id) where.professional_id = String(professional_id);
    const data = await prisma.split_comissoes.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    return res.json(data);
  }

  async createComissao(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const parsed = createComissaoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.split_comissoes.create({
      data: {
        ...parsed.data,
        clinic_id: clinicId,
        status: parsed.data.status || "PENDENTE",
      },
    });
    return res.status(201).json(data);
  }

  // --- Transações ---
  async listTransacoes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await prisma.split_transactions.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    return res.json(data);
  }

  // --- Calculate split distribution for a transaction ---
  async calculateSplit(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const parsed = calculateSplitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    }

    const { transaction_id, total_amount, professional_id, procedure_type } =
      parsed.data;

    // Find matching config for this professional + optional procedure type
    const where: Record<string, unknown> = {
      clinic_id: clinicId,
      professional_id,
      is_active: true,
    };
    if (procedure_type) where.procedure_type = procedure_type;

    let config = await prisma.split_payment_config.findFirst({ where });

    // Fallback: try without procedure_type filter
    if (!config && procedure_type) {
      config = await prisma.split_payment_config.findFirst({
        where: {
          clinic_id: clinicId,
          professional_id,
          is_active: true,
        },
      });
    }

    if (!config) {
      return res
        .status(404)
        .json({ error: "No active split config found for this professional" });
    }

    const percentage = config.percentage as number;
    if (percentage < 0 || percentage > 100) {
      return res
        .status(422)
        .json({ error: "Invalid percentage in config", percentage });
    }
    const professional_amount = Math.round((total_amount * percentage) / 100);
    const clinic_amount = total_amount - professional_amount;

    // Create the split transaction record
    const transaction = await prisma.split_transactions.create({
      data: {
        clinic_id: clinicId,
        transaction_id,
        professional_id,
        total_amount,
        percentage,
        professional_amount,
        clinic_amount,
        status: "PENDING",
      },
    });

    // Create the commission record
    const comissao = await prisma.split_comissoes.create({
      data: {
        clinic_id: clinicId,
        professional_id,
        amount: professional_amount,
        percentage,
        transaction_id,
        config_id: config.id,
        status: "PENDING",
      },
    });

    logger.info("Split calculated", {
      clinicId,
      transaction_id,
      professional_id,
      total_amount,
      percentage,
      professional_amount,
      clinic_amount,
    });

    return res.status(201).json({
      transaction,
      comissao,
      summary: {
        total_amount,
        percentage,
        professional_amount,
        clinic_amount,
      },
    });
  }
}
