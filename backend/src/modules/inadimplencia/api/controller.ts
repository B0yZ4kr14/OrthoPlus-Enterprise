import { Request, Response } from "express";
import { z } from "zod";
import { IInadimplenciaRepository } from "../domain/repositories/IInadimplenciaRepository";
import { InadimplenciaRepository } from "../infrastructure/InadimplenciaRepository";
import { Errors } from "@/middleware/errorHandler";

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
  constructor(
    private repo: IInadimplenciaRepository = new InadimplenciaRepository(),
  ) {}

  async listInadimplentes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await this.repo.findManyInadimplentes(where);
    return res.json(data);
  }

  async getInadimplente(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await this.repo.findInadimplenteById(id, clinicId as string);
    if (!data)     if (!data) throw Errors.notFound("Inadimplente", id);
    return res.json(data);
  }

  async updateInadimplente(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findInadimplenteById(
      id,
      clinicId as string,
    );
    if (!existing)
      throw Errors.notFound("Inadimplente", id);

    const parsed = updateInadimplenteSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateInadimplente(id, parsed.data);
    return res.json(data);
  }

  async listCampanhasCobranca(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await this.repo.findManyCampanhas(where);
    return res.json(data);
  }

  async createCampanhaCobranca(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createCampanhaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createCampanha({
      ...parsed.data,
      clinic_id: clinicId,
      status: parsed.data.status || "ATIVA",
      tipo_campanha: parsed.data.tipo_campanha || "manual",
    });
    return res.status(201).json(data);
  }

  async updateCampanhaCobranca(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findCampanhaById(id, clinicId as string);
    if (!existing)     if (!existing) throw Errors.notFound("Campanha", id);

    const parsed = updateCampanhaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateCampanha(id, parsed.data);
    return res.json(data);
  }
}
