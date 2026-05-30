import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import {
  createDashboardSchema,
  updateDashboardSchema,
  createWidgetSchema,
  updateWidgetSchema,
} from "./schemas";
import { IBIRepository } from "../domain/repositories/IBIRepository";
import { BIRepository } from "../infrastructure/BIRepository";

export class BIController {
  constructor(
    private repo: IBIRepository = new BIRepository(),
  ) {}

  listDashboards = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await this.repo.findManyDashboards(clinicId as string);
    res.json(data);
    return;
  });

  getDashboardById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await this.repo.findDashboardById(id, clinicId as string);
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
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createDashboard({
      ...parsed.data,
      clinic_id: clinicId,
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
    const existing = await this.repo.findDashboardById(id, clinicId as string);
    if (!existing) {
      throw Errors.notFound("Dashboard", id);
    }
    const parsed = updateDashboardSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateDashboard(id, parsed.data);
    res.json(data);
    return;
  });

  getMetricas = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { periodo, tipo } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (periodo) where.periodo = String(periodo);
    if (tipo) where.tipo = String(tipo);
    const data = await this.repo.findManyMetricas(where);
    res.json(data);
    return;
  });

  listWidgets = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { dashboard_id } = req.params;
    const data = await this.repo.findManyWidgets(dashboard_id, clinicId as string);
    res.json(data);
    return;
  });

  createWidget = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { dashboard_id } = req.params;
    const dashboard = await this.repo.findDashboardById(
      dashboard_id,
      clinicId as string,
    );
    if (!dashboard) {
      throw Errors.notFound("Dashboard", dashboard_id);
    }
    const parsed = createWidgetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createWidget({
      ...parsed.data,
      dashboard_id,
      clinic_id: clinicId,
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
    const existing = await this.repo.findWidgetById(id, clinicId as string);
    if (!existing) {
      throw Errors.notFound("Widget", id);
    }
    const parsed = updateWidgetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateWidget(id, parsed.data);
    res.json(data);
    return;
  });

  deleteWidget = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.findWidgetById(id, clinicId as string);
    if (!existing) {
      throw Errors.notFound("Widget", id);
    }
    await this.repo.deleteWidget(id);
    res.status(204).send();
    return;
  });
}
