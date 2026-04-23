import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import { createContratoSchema, updateContratoSchema } from "./schemas";

export class ContratosController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await (prisma as any).contratos.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
    res.json(data);
    return;
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await (prisma as any).contratos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!data) {
      throw Errors.notFound("Contrato", id);
    }
    res.json(data);
    return;
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createContratoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).contratos.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId },
    });
    res.status(201).json(data);
    return;
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).contratos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!existing) {
      throw Errors.notFound("Contrato", id);
    }
    const parsed = updateContratoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).contratos.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id },
      data: parsed.data,
    });
    res.json(data);
    return;
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).contratos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!existing) {
      throw Errors.notFound("Contrato", id);
    }
    await (prisma as any).contratos.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    res.status(204).send();
    return;
  });

  listTemplates = asyncHandler(async (_req: Request, res: Response) => {
    const data = await (prisma as any).contrato_templates.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      orderBy: { nome: "asc" },
    });
    res.json(data);
    return;
  });
}
