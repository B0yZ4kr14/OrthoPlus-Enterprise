import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import {
  createDashboardSchema,
  updateDashboardSchema,
  createWidgetSchema,
  updateWidgetSchema,
} from "./schemas";

export class BIController {
  // --- Dashboards ---
  listDashboards = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await (prisma as any).bi_dashboards.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
    res.json(data);
    return;
  });

  getDashboardById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await (prisma as any).bi_dashboards.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, clinic_id: clinicId },
    });
    if (!data) {
      throw Errors.notFound("Dashboard", id);
    }
    res.json(data);
    return;
  });

  createDashboard = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createDashboardSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).bi_dashboards.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId },
    });
    res.status(201).json(data);
    return;
  });

  updateDashboard = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).bi_dashboards.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, clinic_id: clinicId },
    });
    if (!existing) {
      throw Errors.notFound("Dashboard", id);
    }
    const parsed = updateDashboardSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).bi_dashboards.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id },
      data: parsed.data,
    });
    res.json(data);
    return;
  });

  // --- Metricas ---
  getMetricas = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
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
    return;
  });

  // --- Widgets ---
  listWidgets = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { dashboard_id } = req.params;
    const data = await (prisma as any).bi_widgets.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { dashboard_id, dashboard: { clinic_id: clinicId } },
      orderBy: { posicao: "asc" },
    });
    res.json(data);
    return;
  });

  createWidget = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { dashboard_id } = req.params;
    const dashboard = await (prisma as any).bi_dashboards.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id: dashboard_id, clinic_id: clinicId },
    });
    if (!dashboard) {
      throw Errors.notFound("Dashboard", dashboard_id);
    }
    const parsed = createWidgetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).bi_widgets.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, dashboard_id, clinic_id: clinicId },
    });
    res.status(201).json(data);
    return;
  });

  updateWidget = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).bi_widgets.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, dashboard: { clinic_id: clinicId } },
    });
    if (!existing) {
      throw Errors.notFound("Widget", id);
    }
    const parsed = updateWidgetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).bi_widgets.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id },
      data: parsed.data,
    });
    res.json(data);
    return;
  });

  deleteWidget = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).bi_widgets.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, dashboard: { clinic_id: clinicId } },
    });
    if (!existing) {
      throw Errors.notFound("Widget", id);
    }
    await (prisma as any).bi_widgets.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    res.status(204).send();
    return;
  });
}
