import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";

export class PDVController {
  getDashboardExecutivo = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) { throw Errors.unauthorized("Missing clinic context"); }
    const { periodo } = req.query;
    const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (periodo) where.periodo = String(periodo);
    const data = await (prisma as any).pdv_dashboard.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where,
      orderBy: { data_referencia: "desc" },
    });
    res.json(data);
  });

  getMetasGamificacao = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) { throw Errors.unauthorized("Missing clinic context"); }
    const data = await (prisma as any).pdv_metas_gamificacao.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
    res.json(data);
  });
}
