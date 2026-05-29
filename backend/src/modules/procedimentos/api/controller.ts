import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import { z } from "zod";

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
  async listTemplates(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { especialidade } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (especialidade) where.especialidade = String(especialidade);
    const data = await prisma.procedimento_templates.findMany({
      // eslint-disable-line @typescript-eslint/no-explicit-any
      where,
      orderBy: { nome: "asc" },
    });
    return res.json(data);
  }

  async getTemplateById(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const data = await prisma.procedimento_templates.findFirst({
      // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, clinic_id: clinicId },
    });
    if (!data) return res.status(404).json({ error: "Template not found" });
    return res.json(data);
  }

  async createTemplate(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.procedimento_templates.create({
      // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId } as any,
    });
    return res.status(201).json(data);
  }

  async updateTemplate(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.procedimento_templates.findFirst({
      where: { id, clinic_id: clinicId },
    }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!existing) return res.status(404).json({ error: "Template not found" });
    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.procedimento_templates.update({
      // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id },
      data: parsed.data as any,
    });
    return res.json(data);
  }

  async deleteTemplate(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    await prisma.procedimento_templates.deleteMany({
      where: { id, clinic_id: clinicId },
    }); // eslint-disable-line @typescript-eslint/no-explicit-any
    return res.status(204).send();
  }

  async listTabelas(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const data = await prisma.tabela_precos.findMany({
      where: { clinic_id: clinicId },
      orderBy: { nome: "asc" },
    });
    return res.json(data);
  }

  async getTabelaById(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { id } = req.params;
    const data = await prisma.tabela_precos.findFirst({
      where: { id, clinic_id: clinicId },
      include: { precos: { include: { procedimento_template: true } } },
    });
    if (!data) return res.status(404).json({ error: "Tabela not found" });
    return res.json(data);
  }

  async createTabela(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const parsed = createTabelaSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    if (parsed.data.is_default) {
      await prisma.tabela_precos.updateMany({
        where: { clinic_id: clinicId, is_default: true },
        data: { is_default: false },
      });
    }
    const data = await prisma.tabela_precos.create({
      data: { ...parsed.data, clinic_id: clinicId },
    });
    return res.status(201).json(data);
  }

  async updateTabela(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { id } = req.params;
    const existing = await prisma.tabela_precos.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing) return res.status(404).json({ error: "Tabela not found" });
    const parsed = updateTabelaSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    if (parsed.data.is_default) {
      await prisma.tabela_precos.updateMany({
        where: { clinic_id: clinicId, is_default: true, id: { not: id } },
        data: { is_default: false },
      });
    }
    const data = await prisma.tabela_precos.update({
      where: { id },
      data: parsed.data,
    });
    return res.json(data);
  }

  async deleteTabela(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { id } = req.params;
    await prisma.tabela_precos.deleteMany({
      where: { id, clinic_id: clinicId },
    });
    return res.status(204).send();
  }

  async listPrecos(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { tabela_id, template_id } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (tabela_id) where.tabela_preco_id = String(tabela_id);
    if (template_id) where.procedimento_template_id = String(template_id);
    const data = await prisma.procedimento_precos.findMany({
      where,
      include: { procedimento_template: true, tabela_preco: true },
      orderBy: { created_at: "desc" },
    });
    return res.json(data);
  }

  async createPreco(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const parsed = createPrecoSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    const data = await prisma.procedimento_precos.create({
      data: { ...parsed.data, clinic_id: clinicId },
    });
    return res.status(201).json(data);
  }

  async updatePreco(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { id } = req.params;
    const existing = await prisma.procedimento_precos.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing) return res.status(404).json({ error: "Preco not found" });
    const parsed = updatePrecoSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    const data = await prisma.procedimento_precos.update({
      where: { id },
      data: parsed.data,
    });
    return res.json(data);
  }

  async deletePreco(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { id } = req.params;
    await prisma.procedimento_precos.deleteMany({
      where: { id, clinic_id: clinicId },
    });
    return res.status(204).send();
  }

  async reajustarPrecos(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const parsed = reajusteSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    const { tabela_preco_id, percentual } = parsed.data;
    const tabela = await prisma.tabela_precos.findFirst({
      where: { id: tabela_preco_id, clinic_id: clinicId },
    });
    if (!tabela) return res.status(404).json({ error: "Tabela not found" });
    const fator = 1 + percentual / 100;
    await prisma.$queryRaw`
      UPDATE clinico.procedimento_precos
      SET valor = ROUND(valor * ${fator}),
          updated_at = NOW()
      WHERE tabela_preco_id = ${tabela_preco_id}
        AND clinic_id = ${clinicId}
    `;
    return res.json({
      message: "Reajuste aplicado",
      tabela_preco_id,
      percentual,
    });
  }

  async listDentistaProcs(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { dentista_id } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (dentista_id) where.dentista_id = String(dentista_id);
    const data = await prisma.dentista_procedimentos.findMany({
      where,
      include: { procedimento_template: true },
      orderBy: { created_at: "desc" },
    });
    return res.json(data);
  }

  async createDentistaProc(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const parsed = dentistaProcSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    const data = await prisma.dentista_procedimentos.create({
      data: { ...parsed.data, clinic_id: clinicId },
    });
    return res.status(201).json(data);
  }

  async updateDentistaProc(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { id } = req.params;
    const existing = await prisma.dentista_procedimentos.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing)
      return res.status(404).json({ error: "Associação not found" });
    const parsed = dentistaProcSchema.partial().safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
    const data = await prisma.dentista_procedimentos.update({
      where: { id },
      data: parsed.data,
    });
    return res.json(data);
  }

  async deleteDentistaProc(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId)
      return res.status(401).json({ error: "Missing clinic context" });
    const { id } = req.params;
    await prisma.dentista_procedimentos.deleteMany({
      where: { id, clinic_id: clinicId },
    });
    return res.status(204).send();
  }
}
