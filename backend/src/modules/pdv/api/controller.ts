import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";

export class PDVController {
  getDashboardExecutivo = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { periodo } = req.query;
    const where: { clinic_id: string; periodo?: string } = {
      clinic_id: clinicId,
    };
    if (periodo) where.periodo = String(periodo);
    const data = await prisma.pdv_dashboard.findMany({
      where,
      orderBy: { data_referencia: "desc" },
    });
    res.json(data);
  });

  getMetasGamificacao = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await prisma.pdv_metas_gamificacao.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
    res.json(data);
  });
}
