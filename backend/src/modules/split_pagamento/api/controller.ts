import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { upsertConfigSchema, createComissaoSchema, calculateSplitSchema } from "./schemas";

export class SplitPagamentoController {
  // --- Configuração de split ---
  async getConfig(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const data = await (prisma as any).split_payment_config.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error getting split config", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async upsertConfig(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = upsertConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const existing = await (prisma as any).split_payment_config.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
      });
      let data;
      if (existing) {
        data = await (prisma as any).split_payment_config.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
          where: { id: existing.id },
          data: parsed.data,
        });
      } else {
        data = await (prisma as any).split_payment_config.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
          data: { ...parsed.data, clinic_id: clinicId },
        });
      }
      res.json(data);
    } catch (error) {
      logger.error("Error upserting split config", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Comissões ---
  async listComissoes(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { professional_id } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (professional_id) where.professional_id = String(professional_id);
      const data = await (prisma as any).split_comissoes.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing split comissoes", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createComissao(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createComissaoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).split_comissoes.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating split comissao", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Transações ---
  async listTransacoes(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { status } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (status) where.status = String(status);
      const data = await (prisma as any).split_transactions.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing split transactions", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Calculate split distribution for a transaction ---
  async calculateSplit(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = calculateSplitSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const { transaction_id, total_amount, professional_id, procedure_type } = parsed.data;

      // Find matching config for this professional + optional procedure type
      const where: Record<string, unknown> = {
        clinic_id: clinicId,
        professional_id,
        is_active: true,
      };
      if (procedure_type) where.procedure_type = procedure_type;

      let config = await (prisma as any).split_payment_config.findFirst({ where }); // eslint-disable-line @typescript-eslint/no-explicit-any

      // Fallback: try without procedure_type filter
      if (!config && procedure_type) {
        config = await (prisma as any).split_payment_config.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
          where: {
            clinic_id: clinicId,
            professional_id,
            is_active: true,
          },
        });
      }

      if (!config) {
        res.status(404).json({ error: "No active split config found for this professional" });
        return;
      }

      const percentage = config.percentage as number;
      if (percentage < 0 || percentage > 100) {
        res.status(422).json({ error: "Invalid percentage in config", percentage });
        return;
      }
      const professional_amount = Math.round(total_amount * percentage / 100);
      const clinic_amount = total_amount - professional_amount;

      // Create the split transaction record
      const transaction = await (prisma as any).split_transactions.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
      const comissao = await (prisma as any).split_comissoes.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
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

      res.status(201).json({
        transaction,
        comissao,
        summary: {
          total_amount,
          percentage,
          professional_amount,
          clinic_amount,
        },
      });
    } catch (error) {
      logger.error("Error calculating split", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
