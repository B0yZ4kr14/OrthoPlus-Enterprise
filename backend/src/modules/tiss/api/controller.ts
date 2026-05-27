import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import {
  createGuiaSchema,
  updateGuiaSchema,
  createLoteSchema,
  updateLoteSchema,
  submitBatchSchema,
  registerGlosaSchema,
} from "./schemas";

export class TISSController {
  // --- Guias ---
  async listGuias(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { insurance_company, status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (insurance_company) where.insurance_company = String(insurance_company);
    if (status) where.status = String(status);
    const data = await prisma.tiss_guides.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 1000,
    });
    return res.json(data);
  }

  async getGuiaById(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const data = await prisma.tiss_guides.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!data) {
      return res.status(404).json({ error: "Guia not found" });
    }
    return res.json(data);
  }

  async createGuia(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const parsed = createGuiaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.tiss_guides.create({
      data: { ...parsed.data, clinic_id: clinicId, status: parsed.data.status || "RASCUNHO" },
    });
    return res.status(201).json(data);
  }

  async updateGuia(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.tiss_guides.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      return res.status(404).json({ error: "Guia not found" });
    }
    const parsed = updateGuiaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.tiss_guides.update({
      where: { id },
      data: parsed.data,
    });
    return res.json(data);
  }

  async deleteGuia(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.tiss_guides.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      return res.status(404).json({ error: "Guia not found" });
    }
    await prisma.tiss_guides.delete({ where: { id } });
    return res.status(204).send();
  }

  // --- Lotes ---
  async listLotes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await prisma.tiss_batches.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 1000,
    });
    return res.json(data);
  }

  async createLote(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const parsed = createLoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.tiss_batches.create({
      data: { ...parsed.data, clinic_id: clinicId, status: parsed.data.status || "PENDENTE" },
    });
    return res.status(201).json(data);
  }

  async updateLote(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.tiss_batches.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      return res.status(404).json({ error: "Lote not found" });
    }
    const parsed = updateLoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.tiss_batches.update({
      where: { id },
      data: parsed.data,
    });
    return res.json(data);
  }

  // --- Batch submission: group guides into a batch and mark as submitted ---
  async submitBatch(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const parsed = submitBatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }

    const { guide_ids, insurance_company, batch_number } = parsed.data;

    // Verify all guides belong to this clinic and are in a submittable state
    const guides = await prisma.tiss_guides.findMany({
      where: {
        id: { in: guide_ids },
        clinic_id: clinicId,
      },
    });

    if (guides.length !== guide_ids.length) {
      return res.status(400).json({
        error: "Some guides not found or do not belong to this clinic",
        found: guides.length,
        expected: guide_ids.length,
      });
    }

    // Calculate totals from guides
    const totalAmount = guides.reduce(
      (sum: number, g: { amount?: number }) => sum + (g.amount ?? 0),
      0,
    );

    const generatedBatchNumber =
      batch_number || `LOTE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the batch
    const batch = await prisma.tiss_batches.create({
      data: {
        clinic_id: clinicId,
        batch_number: generatedBatchNumber,
        insurance_company,
        total_guides: guides.length,
        total_amount: totalAmount,
        status: "SUBMITTED",
        sent_at: new Date().toISOString(),
      },
    });

    // Link all guides to this batch and mark them as submitted
    await prisma.tiss_guides.updateMany({
      where: {
        id: { in: guide_ids },
        clinic_id: clinicId,
      },
      data: {
        batch_id: batch.id,
        status: "SUBMITTED",
        submission_date: new Date().toISOString(),
      },
    });

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
      return res.status(401).json({ error: "Missing clinic context" });
    }

    const [guidesByStatus, batchesByStatus, totalAmount, totalGlosa] = await Promise.all([
      prisma.tiss_guides.groupBy({
        by: ["status"],
        where: { clinic_id: clinicId },
        _count: { id: true },
        _sum: { amount: true, glosa_amount: true },
      }),
      prisma.tiss_batches.groupBy({
        by: ["status"],
        where: { clinic_id: clinicId },
        _count: { id: true },
        _sum: { total_amount: true },
      }),
      prisma.tiss_guides.aggregate({
        where: { clinic_id: clinicId },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.tiss_guides.aggregate({
        where: { clinic_id: clinicId, glosa_amount: { not: null } },
        _count: { id: true },
        _sum: { glosa_amount: true },
      }),
    ]);

    return res.json({
      guides: {
        total: totalAmount._count.id ?? 0,
        total_amount: totalAmount._sum.amount ?? 0,
        total_glosa: totalGlosa._sum.glosa_amount ?? 0,
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
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const data = await prisma.tiss_guides.findMany({
      where: { clinic_id: clinicId, glosa_amount: { not: null } },
      orderBy: { glosa_date: "desc" },
      take: 1000,
    });
    return res.json(data);
  }

  async updateGlosa(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.tiss_guides.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      return res.status(404).json({ error: "Guia not found" });
    }
    const parsed = registerGlosaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await prisma.tiss_guides.update({
      where: { id },
      data: {
        status: "glosada",
        glosa_amount: parsed.data.glosa_amount,
        glosa_reason: parsed.data.glosa_reason,
        glosa_date: new Date(),
      },
    });
    logger.info("TISS glosa registered", { clinicId, guideId: id, glosaAmount: parsed.data.glosa_amount });
    return res.json(data);
  }

  async reprocessarGlosa(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.tiss_guides.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      return res.status(404).json({ error: "Guia not found" });
    }
    const data = await prisma.tiss_guides.update({
      where: { id },
      data: { status: "RASCUNHO", glosa_reason: null, glosa_amount: null, glosa_date: null },
    });
    logger.info("TISS glosa reprocessed", { clinicId, guideId: id });
    return res.json({ message: "Guia reprocessada", guide: data });
  }

  // --- Convênios ---
  async listConvenios(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const data = await prisma.tiss_convenios.findMany({
      where: { clinic_id: clinicId },
      orderBy: { nome: "asc" },
    });
    return res.json(data);
  }

  async createConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { nome, codigo_operadora, cnpj, registro_ans, tipo_plano, is_active } = req.body;
    if (!nome) {
      return res.status(400).json({ error: "Nome is required" });
    }
    const data = await prisma.tiss_convenios.create({
      data: { clinic_id: clinicId, nome, codigo_operadora, cnpj, registro_ans, tipo_plano, is_active },
    });
    return res.status(201).json(data);
  }

  async updateConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.tiss_convenios.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      return res.status(404).json({ error: "Convenio not found" });
    }
    const data = await prisma.tiss_convenios.update({
      where: { id },
      data: req.body,
    });
    return res.json(data);
  }

  async deleteConvenio(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await prisma.tiss_convenios.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      return res.status(404).json({ error: "Convenio not found" });
    }
    await prisma.tiss_convenios.delete({ where: { id } });
    return res.status(204).send();
  }
}
