import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { ITISSRepository } from "../domain/repositories/ITISSRepository";
import { TISSRepository } from "../infrastructure/TISSRepository";
import {
  createGuiaSchema,
  updateGuiaSchema,
  createLoteSchema,
  updateLoteSchema,
  submitBatchSchema,
  registerGlosaSchema,
} from "./schemas";
import { Errors } from "@/middleware/errorHandler";

export class TISSController {
  constructor(private repo: ITISSRepository = new TISSRepository()) {}

  // --- Guias ---
  async listGuias(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { insurance_company, status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (insurance_company) where.insurance_company = String(insurance_company);
    if (status) where.status = String(status);
    const data = await this.repo.findManyGuias(where);
    return res.json(data);
  }

  async getGuiaById(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await this.repo.findGuiaById(id, clinicId);
    if (!data) {
      throw Errors.notFound("Guia", id);
    }
    return res.json(data);
  }

  async createGuia(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createGuiaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createGuia({
      ...parsed.data,
      clinic_id: clinicId,
      status: parsed.data.status || "RASCUNHO",
    });
    return res.status(201).json(data);
  }

  async updateGuia(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findGuiaById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Guia", id);
    }
    const parsed = updateGuiaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateGuia(id, parsed.data);
    return res.json(data);
  }

  async deleteGuia(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findGuiaById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Guia", id);
    }
    await this.repo.deleteGuia(id, clinicId);
    return res.status(204).send();
  }

  // --- Lotes ---
  async listLotes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await this.repo.findManyLotes(where);
    return res.json(data);
  }

  async createLote(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createLoteSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createLote({
      ...parsed.data,
      clinic_id: clinicId,
      status: parsed.data.status || "PENDENTE",
    });
    return res.status(201).json(data);
  }

  async updateLote(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findLoteById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Lote", id);
    }
    const parsed = updateLoteSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateLote(id, parsed.data);
    return res.json(data);
  }

  // --- Batch submission: group guides into a batch and mark as submitted ---
  async submitBatch(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = submitBatchSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }

    const { guide_ids, insurance_company, batch_number } = parsed.data;

    // Verify all guides belong to this clinic and are in a submittable state
    const guides = (await this.repo.findManyGuias({
      id: { in: guide_ids },
      clinic_id: clinicId,
    })) as Array<{ amount?: number }>;

    if (guides.length !== guide_ids.length) {
            throw Errors.validation("Some guides not found or do not belong to this clinic");
    }

    // Calculate totals from guides
    const totalAmount = guides.reduce(
      (sum: number, g: { amount?: number }) => sum + (g.amount ?? 0),
      0,
    );

    const generatedBatchNumber =
      batch_number ||
      `LOTE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the batch
    const batch = (await this.repo.createBatch({
      clinic_id: clinicId,
      batch_number: generatedBatchNumber,
      insurance_company,
      total_guides: guides.length,
      total_amount: totalAmount,
      status: "SUBMITTED",
      sent_at: new Date().toISOString(),
    })) as { id: string };

    // Link all guides to this batch and mark them as submitted
    await this.repo.updateManyGuias(
      {
        id: { in: guide_ids },
        clinic_id: clinicId,
      },
      {
        batch_id: batch.id,
        status: "SUBMITTED",
        submission_date: new Date().toISOString(),
      },
    );

    logger.info("TISS batch submitted", {
      clinicId,
      batchId: batch.id,
      guidesCount: guides.length,
      totalAmount,
    });

    return res.status(201).json({
      batch,
      guides_submitted: guides.length,
      total_amount: totalAmount,
    });
  }

  // --- Statistics: per-clinic summary of guides and batches ---
  async getStatistics(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const [guidesByStatus, batchesByStatus, totalAmount, totalGlosa] =
      (await Promise.all([
        this.repo.groupByGuias({
          by: ["status"],
          where: { clinic_id: clinicId },
          _count: { id: true },
          _sum: { amount: true, glosa_amount: true },
        }),
        this.repo.groupByBatches({
          by: ["status"],
          where: { clinic_id: clinicId },
          _count: { id: true },
          _sum: { total_amount: true },
        }),
        this.repo.aggregateGuias({
          where: { clinic_id: clinicId },
          _count: { id: true },
          _sum: { amount: true },
        }),
        this.repo.aggregateGuias({
          where: { clinic_id: clinicId, glosa_amount: { not: null } },
          _count: { id: true },
          _sum: { glosa_amount: true },
        }),
      ])) as [
        unknown,
        unknown,
        { _count: { id: number }; _sum: { amount: number | null } },
        { _count: { id: number }; _sum: { glosa_amount: number | null } },
      ];

    return res.json({
      guides: {
        total: totalAmount._count.id ?? 0,
        total_amount: totalAmount._sum.amount ?? 0,
        total_glosa: totalGlosa._sum?.glosa_amount ?? 0,
        by_status: guidesByStatus,
      },
      batches: {
        by_status: batchesByStatus,
      },
    });
  }

  // --- Glosas ---
  async listGlosas(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await this.repo.findManyGuias(
      { clinic_id: clinicId, glosa_amount: { not: null } },
      { glosa_date: "desc" },
    );
    return res.json(data);
  }

  async updateGlosa(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findGuiaById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Guia", id);
    }
    const parsed = registerGlosaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateGuia(id, {
      status: "glosada",
      glosa_amount: parsed.data.glosa_amount,
      glosa_reason: parsed.data.glosa_reason,
      glosa_date: new Date(),
    });
    logger.info("TISS glosa registered", {
      clinicId,
      guideId: id,
      glosaAmount: parsed.data.glosa_amount,
    });
    return res.json(data);
  }

  async reprocessarGlosa(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findGuiaById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Guia", id);
    }
    const data = await this.repo.updateGuia(id, {
      status: "RASCUNHO",
      glosa_reason: null,
      glosa_amount: null,
      glosa_date: null,
    });
    logger.info("TISS glosa reprocessed", { clinicId, guideId: id });
    return res.json({ message: "Guia reprocessada", guide: data });
  }

  // --- Convênios ---
  async listConvenios(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await this.repo.findManyConvenios(clinicId);
    return res.json(data);
  }

  async createConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const {
      nome,
      codigo_operadora,
      cnpj,
      registro_ans,
      tipo_plano,
      is_active,
    } = req.body;
    if (!nome) {
      throw Errors.validation("Nome is required");
    }
    const data = await this.repo.createConvenio({
      clinic_id: clinicId,
      nome,
      codigo_operadora,
      cnpj,
      registro_ans,
      tipo_plano,
      is_active,
    });
    return res.status(201).json(data);
  }

  async updateConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findConvenioById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Convenio", id);
    }
    const data = await this.repo.updateConvenio(id, req.body);
    return res.json(data);
  }

  async deleteConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findConvenioById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Convenio", id);
    }
    await this.repo.deleteConvenio(id, clinicId);
    return res.status(204).send();
  }

  // --- Vinculação Paciente-Convênio ---
  async listPacienteConvenios(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { patient_id } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (patient_id) where.patient_id = String(patient_id);
    const data = await this.repo.findManyPacienteConvenios(where);
    return res.json(data);
  }

  async createPacienteConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { patient_id, convenio_id, numero_carteira, validade_carteira } =
      req.body;
    if (!patient_id || !convenio_id) {
      throw Errors.validation("patient_id and convenio_id are required");
    }
    const data = await this.repo.createPacienteConvenio({
      clinic_id: clinicId,
      patient_id,
      convenio_id,
      numero_carteira,
      validade_carteira,
    });
    logger.info("Paciente convenio created", {
      clinicId,
      patientId: patient_id,
      convenioId: convenio_id,
    });
    return res.status(201).json(data);
  }

  async updatePacienteConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findPacienteConvenioById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Vinculacao", id);
    }
    const data = await this.repo.updatePacienteConvenio(id, req.body);
    return res.json(data);
  }

  async deletePacienteConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findPacienteConvenioById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Vinculacao", id);
    }
    await this.repo.deletePacienteConvenio(id, clinicId);
    return res.status(204).send();
  }
}
