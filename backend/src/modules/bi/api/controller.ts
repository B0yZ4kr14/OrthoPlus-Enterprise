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
    const data = await prisma.bi_dashboards.findMany({
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
    const data = await prisma.bi_dashboards.findFirst({
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
    const data = await prisma.bi_dashboards.create({
      data: { ...parsed.data, clinic_id: clinicId } as any,
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
    const existing = await prisma.bi_dashboards.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing) {
      throw Errors.notFound("Dashboard", id);
    }
    const parsed = updateDashboardSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await prisma.bi_dashboards.update({
      where: { id },
      data: parsed.data as any,
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
    const data = await prisma.bi_metrics.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
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
    const data = await prisma.bi_widgets.findMany({
      where: { dashboard_id, clinic_id: clinicId },
      orderBy: { position_y: "asc" },
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
    const dashboard = await prisma.bi_dashboards.findFirst({
      where: { id: dashboard_id, clinic_id: clinicId },
    });
    if (!dashboard) {
      throw Errors.notFound("Dashboard", dashboard_id);
    }
    const parsed = createWidgetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await prisma.bi_widgets.create({
      data: { ...parsed.data, dashboard_id, clinic_id: clinicId } as any,
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
    const existing = await prisma.bi_widgets.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing) {
      throw Errors.notFound("Widget", id);
    }
    const parsed = updateWidgetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await prisma.bi_widgets.update({
      where: { id },
      data: parsed.data as any,
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
    const existing = await prisma.bi_widgets.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing) {
      throw Errors.notFound("Widget", id);
    }
    await prisma.bi_widgets.delete({ where: { id } });
    res.status(204).send();
    return;
  });
}
