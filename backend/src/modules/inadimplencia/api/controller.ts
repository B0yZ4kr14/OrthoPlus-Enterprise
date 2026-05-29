import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import { z } from "zod";

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
  tipo_campanha: z.string().max(100).optional(),
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
  async listInadimplentes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await prisma.inadimplentes.findMany({
      where,
      orderBy: { valor_total_devido: "desc" },
    });
    return res.json(data);
  }

  async getInadimplente(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const data = await prisma.inadimplentes.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!data) return res.status(404).json({ error: "Inadimplente not found" });
    return res.json(data);
  }

  async updateInadimplente(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.inadimplentes.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing)
      return res.status(404).json({ error: "Inadimplente not found" });

    const parsed = updateInadimplenteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.inadimplentes.update({
      where: { id },
      data: parsed.data,
    });
    return res.json(data);
  }

  async listCampanhasCobranca(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await prisma.campanhas_inadimplencia.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    return res.json(data);
  }

  async createCampanhaCobranca(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const parsed = createCampanhaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.campanhas_inadimplencia.create({
      data: {
        ...parsed.data,
        clinic_id: clinicId,
        status: parsed.data.status || "ATIVA",
        tipo_campanha: parsed.data.tipo_campanha || "manual",
      },
    });
    return res.status(201).json(data);
  }

  async updateCampanhaCobranca(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.campanhas_inadimplencia.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing) return res.status(404).json({ error: "Campanha not found" });

    const parsed = updateCampanhaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.campanhas_inadimplencia.update({
      where: { id },
      data: parsed.data,
    });
    return res.json(data);
  }
}
