import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation schemas — only whitelisted fields are accepted
// ---------------------------------------------------------------------------

const updateInadimplenteSchema = z.object({
  status: z.string().max(100).optional(),
  valor_devido: z.number().nonnegative().optional(),
  data_vencimento: z.string().optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
  dias_atraso: z.number().int().nonnegative().optional(),
});

const createCampanhaSchema = z.object({
  nome: z.string().min(1).max(200),
  descricao: z.string().max(1000).optional(),
  status: z.string().max(100).optional(),
  data_inicio: z.string().optional().nullable(),
  data_fim: z.string().optional().nullable(),
  tipo_cobranca: z.string().max(100).optional(),
  mensagem_template: z.string().max(2000).optional().nullable(),
});

const updateCampanhaSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(1000).optional(),
  status: z.string().max(100).optional(),
  data_inicio: z.string().optional().nullable(),
  data_fim: z.string().optional().nullable(),
  tipo_cobranca: z.string().max(100).optional(),
  mensagem_template: z.string().max(2000).optional().nullable(),
});

export class InadimplenciaController {
  // --- Inadimplentes ---
  async listInadimplentes(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { status } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (status) where.status = String(status);
      const data = await (prisma as any).inadimplentes.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { valor_devido: "desc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error listing inadimplentes", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getInadimplente(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { id } = req.params;
      const data = await (prisma as any).inadimplentes.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, clinic_id: clinicId },
      });
      if (!data) return res.status(404).json({ error: "Inadimplente not found" });
      return res.json(data);
    } catch (error) {
      logger.error("Error getting inadimplente", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateInadimplente(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { id } = req.params;
      const existing = await (prisma as any).inadimplentes.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) return res.status(404).json({ error: "Inadimplente not found" });

      const parsed = updateInadimplenteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).inadimplentes.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error updating inadimplente", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Campanhas de cobrança ---
  async listCampanhasCobranca(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { status } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (status) where.status = String(status);
      const data = await (prisma as any).campanhas_inadimplencia.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error listing campanhas cobranca", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async createCampanhaCobranca(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const parsed = createCampanhaSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).campanhas_inadimplencia.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating campanha cobranca", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateCampanhaCobranca(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { id } = req.params;
      const existing = await (prisma as any).campanhas_inadimplencia.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) return res.status(404).json({ error: "Campanha not found" });

      const parsed = updateCampanhaSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).campanhas_inadimplencia.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error updating campanha cobranca", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
