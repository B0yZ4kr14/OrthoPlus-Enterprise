import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import {
  createDashboardSchema,
  updateDashboardSchema,
  createWidgetSchema,
  updateWidgetSchema,
} from "./schemas";

export class BIController {
  // --- Dashboards ---
  async listDashboards(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const data = await (prisma as any).bi_dashboards.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing BI dashboards", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getDashboardById(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const data = await (prisma as any).bi_dashboards.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, clinic_id: clinicId },
      });
      if (!data) {
        res.status(404).json({ error: "Dashboard not found" });
        return;
      }
      res.json(data);
    } catch (error) {
      logger.error("Error getting BI dashboard", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createDashboard(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createDashboardSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).bi_dashboards.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating BI dashboard", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateDashboard(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).bi_dashboards.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, clinic_id: clinicId },
      });
      if (!existing) {
        res.status(404).json({ error: "Dashboard not found" });
        return;
      }
      const parsed = updateDashboardSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).bi_dashboards.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating BI dashboard", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Metricas ---
  async getMetricas(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { periodo, tipo } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (periodo) where.periodo = String(periodo);
      if (tipo) where.tipo = String(tipo);
      const data = await (prisma as any).bi_metrics.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { data_referencia: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error getting BI metrics", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Widgets ---
  async listWidgets(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { dashboard_id } = req.params;
      const data = await (prisma as any).bi_widgets.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { dashboard_id, dashboard: { clinic_id: clinicId } },
        orderBy: { posicao: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing BI widgets", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createWidget(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { dashboard_id } = req.params;
      const dashboard = await (prisma as any).bi_dashboards.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: dashboard_id, clinic_id: clinicId },
      });
      if (!dashboard) {
        res.status(404).json({ error: "Dashboard not found" });
        return;
      }
      const parsed = createWidgetSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).bi_widgets.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, dashboard_id, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating BI widget", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateWidget(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).bi_widgets.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, dashboard: { clinic_id: clinicId } },
      });
      if (!existing) {
        res.status(404).json({ error: "Widget not found" });
        return;
      }
      const parsed = updateWidgetSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).bi_widgets.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating BI widget", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteWidget(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).bi_widgets.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, dashboard: { clinic_id: clinicId } },
      });
      if (!existing) {
        res.status(404).json({ error: "Widget not found" });
        return;
      }
      await (prisma as any).bi_widgets.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting BI widget", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
