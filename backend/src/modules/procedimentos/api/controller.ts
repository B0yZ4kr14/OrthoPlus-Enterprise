import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation schemas — only whitelisted fields are accepted
// ---------------------------------------------------------------------------

const createTemplateSchema = z.object({
  nome: z.string().min(1).max(200),
  descricao: z.string().max(2000).optional().nullable(),
  especialidade: z.string().max(100).optional().nullable(),
  duracao_estimada_min: z.number().int().nonnegative().optional().nullable(),
  valor_sugerido: z.number().nonnegative().optional().nullable(),
  codigo_tuss: z.string().max(50).optional().nullable(),
  is_active: z.boolean().optional(),
});

const updateTemplateSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).optional().nullable(),
  especialidade: z.string().max(100).optional().nullable(),
  duracao_estimada_min: z.number().int().nonnegative().optional().nullable(),
  valor_sugerido: z.number().nonnegative().optional().nullable(),
  codigo_tuss: z.string().max(50).optional().nullable(),
  is_active: z.boolean().optional(),
});

export class ProcedimentosController {
  async listTemplates(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { especialidade } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (especialidade) where.especialidade = String(especialidade);
      const data = await (prisma as any).procedimento_templates.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { nome: "asc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error listing procedure templates", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getTemplateById(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { id } = req.params;
      const data = await (prisma as any).procedimento_templates.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, clinic_id: clinicId },
      });
      if (!data) return res.status(404).json({ error: "Template not found" });
      return res.json(data);
    } catch (error) {
      logger.error("Error getting procedure template", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async createTemplate(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const parsed = createTemplateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).procedimento_templates.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating procedure template", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }
      const { id } = req.params;
      const existing = await (prisma as any).procedimento_templates.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) return res.status(404).json({ error: "Template not found" });
      const parsed = updateTemplateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }
      const data = await (prisma as any).procedimento_templates.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error updating procedure template", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
