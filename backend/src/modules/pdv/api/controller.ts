import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";


export class PDVController {
  async getDashboardExecutivo(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Missing clinic context" }); return; }
      const { periodo } = req.query;
      const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (periodo) where.periodo = String(periodo);
      const data = await (prisma as any).pdv_dashboard.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { data_referencia: "desc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error getting PDV dashboard", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getMetasGamificacao(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Missing clinic context" }); return; }
      const data = await (prisma as any).pdv_metas_gamificacao.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error getting PDV metas gamificacao", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
