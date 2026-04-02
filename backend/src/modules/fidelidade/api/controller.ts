import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation schemas — only whitelisted fields are accepted
// ---------------------------------------------------------------------------

const addPointsSchema = z.object({
  patient_id: z.string().uuid(),
  pontos: z.number().int().positive(),
  descricao: z.string().max(500).optional(),
  referencia_id: z.string().uuid().optional().nullable(),
  referencia_tipo: z.string().max(100).optional().nullable(),
});

const createBadgeSchema = z.object({
  nome: z.string().min(1).max(200),
  descricao: z.string().max(1000).optional(),
  icone_url: z.string().url().optional().nullable(),
  pontos_necessarios: z.number().int().nonnegative(),
  is_active: z.boolean().optional(),
});

const createRecompensaSchema = z.object({
  nome: z.string().min(1).max(200),
  descricao: z.string().max(1000).optional(),
  pontos_necessarios: z.number().int().nonnegative(),
  valor_desconto: z.number().nonnegative().optional().nullable(),
  tipo: z.string().max(100).optional(),
  ativo: z.boolean().optional(),
});

const createIndicacaoSchema = z.object({
  referrer_id: z.string().uuid(),
  referred_patient_id: z.string().uuid(),
  status: z.string().max(100).optional(),
  pontos_concedidos: z.number().int().nonnegative().optional(),
});

export class FidelidadeController {
  // --- Pontos ---
  async getPoints(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { patient_id } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (patient_id) where.patient_id = String(patient_id);
      const data = await (prisma as any).fidelidade_pontos.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error getting points", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async addPoints(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const parsed = addPointsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).fidelidade_pontos.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error("Error adding points", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Badges ---
  async listBadges(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const where = { clinic_id: clinicId };
      const data = await (prisma as any).fidelidade_badges.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { nome: "asc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error listing badges", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async createBadge(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const parsed = createBadgeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).fidelidade_badges.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating badge", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Recompensas ---
  async listRecompensas(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { ativo } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (ativo !== undefined) where.ativo = ativo === "true";
      const data = await (prisma as any).fidelidade_recompensas.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { pontos_necessarios: "asc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error listing recompensas", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async createRecompensa(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const parsed = createRecompensaSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).fidelidade_recompensas.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating recompensa", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Indicações ---
  async listIndicacoes(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { referrer_id } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (referrer_id) where.referrer_id = String(referrer_id);
      const data = await (prisma as any).fidelidade_indicacoes.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error listing indicacoes", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async createIndicacao(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const parsed = createIndicacaoSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).fidelidade_indicacoes.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating indicacao", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
