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
    const data = await prisma.crm_leads.findMany({
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
    const data = await prisma.crm_leads.findFirst({ where: { id, clinic_id: clinicId } });
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
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await prisma.crm_leads.create({
      data: { ...parsed.data, clinic_id: clinicId, created_by: req.user?.id || "system", status: parsed.data.status || "NOVO", source: parsed.data.source || "manual" },
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
    const existing = await prisma.crm_leads.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      throw Errors.notFound("Lead", id);
    }
    const parsed = updateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await prisma.crm_leads.update({
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
    const existing = await prisma.crm_leads.findFirst({ where: { id, clinic_id: clinicId } });
    if (!existing) {
      throw Errors.notFound("Lead", id);
    }
    await prisma.crm_leads.delete({ where: { id } });
    res.status(204).send();
    return;
  });
}
