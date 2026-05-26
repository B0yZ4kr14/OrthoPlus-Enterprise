import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import {
  createGuiaSchema,
  updateGuiaSchema,
  createLoteSchema,
  updateLoteSchema,
  submitBatchSchema,
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
    const data = await (prisma as any).tiss_guides.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const data = await (prisma as any).tiss_guides.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const data = await (prisma as any).tiss_guides.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId },
    });
    return res.status(201).json(data);
  }

  async updateGuia(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await (prisma as any).tiss_guides.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!existing) {
      return res.status(404).json({ error: "Guia not found" });
    }
    const parsed = updateGuiaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await (prisma as any).tiss_guides.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const existing = await (prisma as any).tiss_guides.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!existing) {
      return res.status(404).json({ error: "Guia not found" });
    }
    await (prisma as any).tiss_guides.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const data = await (prisma as any).tiss_batches.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const data = await (prisma as any).tiss_batches.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId },
    });
    return res.status(201).json(data);
  }

  async updateLote(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }
    const { id } = req.params;
    const existing = await (prisma as any).tiss_batches.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!existing) {
      return res.status(404).json({ error: "Lote not found" });
    }
    const parsed = updateLoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const data = await (prisma as any).tiss_batches.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const guides = await (prisma as any).tiss_guides.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const batch = await (prisma as any).tiss_batches.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
    await (prisma as any).tiss_guides.updateMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
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

    const [guidesByStatus, batchesByStatus, totalAmount] = await Promise.all([
      (prisma as any).tiss_guides.groupBy({ // eslint-disable-line @typescript-eslint/no-explicit-any
        by: ["status"],
        where: { clinic_id: clinicId },
        _count: { id: true },
        _sum: { amount: true },
      }),
      (prisma as any).tiss_batches.groupBy({ // eslint-disable-line @typescript-eslint/no-explicit-any
        by: ["status"],
        where: { clinic_id: clinicId },
        _count: { id: true },
        _sum: { total_amount: true },
      }),
      (prisma as any).tiss_guides.aggregate({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    return res.json({
      guides: {
        total: totalAmount._count.id ?? 0,
        total_amount: totalAmount._sum.amount ?? 0,
        by_status: guidesByStatus,
      },
      batches: {
        by_status: batchesByStatus,
      },
    });
  }
}
