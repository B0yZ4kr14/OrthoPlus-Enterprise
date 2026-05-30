import { Request, Response } from "express";
import { z } from "zod";
import { IProcedimentosRepository } from "../domain/repositories/IProcedimentosRepository";
import { ProcedimentosRepository } from "../infrastructure/ProcedimentosRepository";
import { Errors } from "@/middleware/errorHandler";

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

const createTabelaSchema = z.object({
  nome: z.string().min(1).max(200),
  tipo: z.enum(["PARTICULAR", "CONVENIO"]),
  convenio_id: z.string().optional().nullable(),
  is_default: z.boolean().optional(),
});

const updateTabelaSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  tipo: z.enum(["PARTICULAR", "CONVENIO"]).optional(),
  convenio_id: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
});

const createPrecoSchema = z.object({
  procedimento_template_id: z.string().uuid(),
  tabela_preco_id: z.string().uuid(),
  valor: z.number().int().nonnegative(),
  tempo_retorno_dias: z.number().int().nonnegative().optional().nullable(),
});

const updatePrecoSchema = z.object({
  valor: z.number().int().nonnegative().optional(),
  tempo_retorno_dias: z.number().int().nonnegative().optional().nullable(),
});

const reajusteSchema = z.object({
  tabela_preco_id: z.string().uuid(),
  percentual: z.number().min(-100).max(1000),
});

const dentistaProcSchema = z.object({
  dentista_id: z.string().min(1),
  procedimento_template_id: z.string().uuid(),
  duracao_customizada_min: z.number().int().nonnegative().optional().nullable(),
  comissao_percentual: z.number().min(0).max(100).optional(),
  is_active: z.boolean().optional(),
});

export class ProcedimentosController {
  constructor(
    private repo: IProcedimentosRepository = new ProcedimentosRepository(),
  ) {}

  async listTemplates(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { especialidade } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (especialidade) where.especialidade = String(especialidade);
    const data = await this.repo.findManyTemplates(where);
    return res.json(data);
  }

  async getTemplateById(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await this.repo.findTemplateById(id, clinicId as string);
    if (!data) if (!data) throw Errors.notFound("Template", id);
    return res.json(data);
  }

  async createTemplate(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createTemplate({
      ...parsed.data,
      clinic_id: clinicId,
    });
    return res.status(201).json(data);
  }

  async updateTemplate(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findTemplateById(id, clinicId as string);
    if (!existing) if (!existing) throw Errors.notFound("Template", id);
    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateTemplate(id, parsed.data);
    return res.json(data);
  }

  async deleteTemplate(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    await this.repo.deleteTemplate(id, clinicId as string);
    return res.status(204).send();
  }

  async listTabelas(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const data = await this.repo.findManyTabelas(clinicId as string);
    return res.json(data);
  }

  async getTabelaById(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { id } = req.params;
    const data = await this.repo.findTabelaById(id, clinicId as string);
    if (!data) if (!data) throw Errors.notFound("Tabela", id);
    return res.json(data);
  }

  async createTabela(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const parsed = createTabelaSchema.safeParse(req.body);
    if (!parsed.success)
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    if (parsed.data.is_default) {
      await this.repo.updateManyTabelas(
        { clinic_id: clinicId, is_default: true },
        { is_default: false },
      );
    }
    const data = await this.repo.createTabela({
      ...parsed.data,
      clinic_id: clinicId,
    });
    return res.status(201).json(data);
  }

  async updateTabela(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { id } = req.params;
    const existing = await this.repo.findTabelaById(id, clinicId as string);
    if (!existing) if (!existing) throw Errors.notFound("Tabela", id);
    const parsed = updateTabelaSchema.safeParse(req.body);
    if (!parsed.success)
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    if (parsed.data.is_default) {
      await this.repo.updateManyTabelas(
        { clinic_id: clinicId, is_default: true, id: { not: id } },
        { is_default: false },
      );
    }
    const data = await this.repo.updateTabela(id, parsed.data);
    return res.json(data);
  }

  async deleteTabela(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { id } = req.params;
    await this.repo.deleteTabela(id, clinicId as string);
    return res.status(204).send();
  }

  async listPrecos(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { tabela_id, template_id } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (tabela_id) where.tabela_preco_id = String(tabela_id);
    if (template_id) where.procedimento_template_id = String(template_id);
    const data = await this.repo.findManyPrecos(where);
    return res.json(data);
  }

  async createPreco(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const parsed = createPrecoSchema.safeParse(req.body);
    if (!parsed.success)
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    const data = await this.repo.createPreco({
      ...parsed.data,
      clinic_id: clinicId,
    });
    return res.status(201).json(data);
  }

  async updatePreco(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { id } = req.params;
    const existing = await this.repo.findPrecoById(id, clinicId as string);
    if (!existing) if (!existing) throw Errors.notFound("Preco", id);
    const parsed = updatePrecoSchema.safeParse(req.body);
    if (!parsed.success)
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    const data = await this.repo.updatePreco(id, parsed.data);
    return res.json(data);
  }

  async deletePreco(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { id } = req.params;
    await this.repo.deletePreco(id, clinicId as string);
    return res.status(204).send();
  }

  async reajustarPrecos(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const parsed = reajusteSchema.safeParse(req.body);
    if (!parsed.success)
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    const { tabela_preco_id, percentual } = parsed.data;
    const tabela = await this.repo.findTabelaById(
      tabela_preco_id,
      clinicId as string,
    );
    if (!tabela) throw Errors.notFound("Tabela", tabela_preco_id);
    const fator = 1 + percentual / 100;
    await this.repo.reajustarPrecos(fator, tabela_preco_id, clinicId as string);
    return res.json({
      message: "Reajuste aplicado",
      tabela_preco_id,
      percentual,
    });
  }

  async listDentistaProcs(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { dentista_id } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (dentista_id) where.dentista_id = String(dentista_id);
    const data = await this.repo.findManyDentistaProcs(where);
    return res.json(data);
  }

  async createDentistaProc(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const parsed = dentistaProcSchema.safeParse(req.body);
    if (!parsed.success)
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    const data = await this.repo.createDentistaProc({
      ...parsed.data,
      clinic_id: clinicId,
    });
    return res.status(201).json(data);
  }

  async updateDentistaProc(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { id } = req.params;
    const existing = await this.repo.findDentistaProcById(
      id,
      clinicId as string,
    );
    if (!existing) throw Errors.notFound("Associação", id);
    const parsed = dentistaProcSchema.partial().safeParse(req.body);
    if (!parsed.success)
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    const data = await this.repo.updateDentistaProc(id, parsed.data);
    return res.json(data);
  }

  async deleteDentistaProc(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw Errors.unauthorized("Missing clinic context");
    const { id } = req.params;
    await this.repo.deleteDentistaProc(id, clinicId as string);
    return res.status(204).send();
  }
}
