import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import {
  upsertConfigSchema,
  createComissaoSchema,
  calculateSplitSchema,
} from "./schemas";
import { ISplitPagamentoRepository } from "../domain/repositories/ISplitPagamentoRepository";
import { SplitPagamentoRepository } from "../infrastructure/SplitPagamentoRepository";

export class SplitPagamentoController {
  constructor(
    private repo: ISplitPagamentoRepository = new SplitPagamentoRepository(),
  ) {}

  async getConfig(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const data = await this.repo.findManyConfig(clinicId as string);
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
    const existing = await this.repo.findConfigByClinic(clinicId as string);
    let data;
    if (existing) {
      data = await this.repo.updateConfig(
        (existing as any).id,
        parsed.data,
      );
    } else {
      data = await this.repo.createConfig({
        ...parsed.data,
        clinic_id: clinicId,
        is_active: parsed.data.is_active ?? true,
      });
    }
    return res.json(data);
  }

  async listComissoes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { professional_id } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (professional_id) where.professional_id = String(professional_id);
    const data = await this.repo.findManyComissoes(where);
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
    const data = await this.repo.createComissao({
      ...parsed.data,
      clinic_id: clinicId,
      status: parsed.data.status || "PENDENTE",
    });
    return res.status(201).json(data);
  }

  async listTransacoes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await this.repo.findManyTransacoes(where);
    return res.json(data);
  }

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

    let config = await this.repo.findConfigByProfessional(
      clinicId as string,
      professional_id,
      procedure_type ?? undefined,
    );

    if (!config && procedure_type) {
      config = await this.repo.findConfigByProfessional(
        clinicId as string,
        professional_id,
      );
    }

    if (!config) {
      return res
        .status(404)
        .json({ error: "No active split config found for this professional" });
    }

    const percentage = (config as any).percentage as number;
    if (percentage < 0 || percentage > 100) {
      return res
        .status(422)
        .json({ error: "Invalid percentage in config", percentage });
    }
    const professional_amount = Math.round((total_amount * percentage) / 100);
    const clinic_amount = total_amount - professional_amount;

    const transaction = await this.repo.createTransacao({
      clinic_id: clinicId,
      transaction_id,
      professional_id,
      total_amount,
      percentage,
      professional_amount,
      clinic_amount,
      status: "PENDING",
    });

    const comissao = await this.repo.createComissao({
      clinic_id: clinicId,
      professional_id,
      amount: professional_amount,
      percentage,
      transaction_id,
      config_id: (config as any).id,
      status: "PENDING",
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
