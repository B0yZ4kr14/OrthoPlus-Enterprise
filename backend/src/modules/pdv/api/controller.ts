import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import { IPdvRepository } from "../domain/repositories/IPdvRepository";
import { PdvRepository } from "../infrastructure/PdvRepository";

export class PDVController {
  constructor(private repo: IPdvRepository = new PdvRepository()) {}

  getDashboardExecutivo = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { periodo } = req.query;
    const where: Record<string, unknown> = {
      clinic_id: clinicId,
    };
    if (periodo) where.periodo = String(periodo);
    const data = await this.repo.findManyDashboard(where);
    res.json(data);
  });

  getMetasGamificacao = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await this.repo.findManyMetas(clinicId as string);
    res.json(data);
  });
}
