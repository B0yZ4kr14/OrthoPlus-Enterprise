import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import { createLeadSchema, updateLeadSchema } from "./schemas";

export class CRMController {
  listLeads = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await (prisma as any).crm_leads.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where,
      orderBy: { created_at: "desc" },
    });
    res.json(data);
    return;
  });

  getLeadById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await (prisma as any).crm_leads.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!data) {
      throw Errors.notFound("Lead", id);
    }
    res.json(data);
    return;
  });

  createLead = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).crm_leads.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId },
    });
    res.status(201).json(data);
    return;
  });

  updateLead = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).crm_leads.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!existing) {
      throw Errors.notFound("Lead", id);
    }
    const parsed = updateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).crm_leads.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id },
      data: parsed.data,
    });
    res.json(data);
    return;
  });

  deleteLead = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).crm_leads.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!existing) {
      throw Errors.notFound("Lead", id);
    }
    await (prisma as any).crm_leads.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    res.status(204).send();
    return;
  });
}
