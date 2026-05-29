import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { DatabaseAdminControllerService } from "@/modules/database_admin/application/DatabaseAdminControllerService";

export class DatabaseAdminController {
  private service = new DatabaseAdminControllerService();

  getHealth = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = await this.service.getHealth(clinicId);
    res.json(result);
  });

  getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const { user_id, action, from, to } = req.query;
    const result = await this.service.getAuditLogs(clinicId, {
      user_id: user_id ? String(user_id) : undefined,
      action: action ? String(action) : undefined,
      from: from ? String(from) : undefined,
      to: to ? String(to) : undefined,
    });
    res.json(result);
  });

  getSlowQueries = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = await this.service.getSlowQueries(clinicId);
    res.json({ slowQueries: result });
  });

  runMaintenance = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    const isAdmin = req.user?.role === "ADMIN";
    const result = await this.service.runMaintenance(
      req.body,
      clinicId || "",
      isAdmin,
    );
    if (!result.success) {
      res.status(500).json(result);
      return;
    }
    res.json(result);
  });

  getConnectionPool = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = await this.service.getConnectionPool();
    res.json({ poolStats: result });
  });

  createAuditLog = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { action, actionType, details } = req.body;
    const log = await this.service.createAuditLog({
      clinicId,
      userId: req.user?.id,
      action,
      actionType,
      details,
      ipAddress: req.ip || "unknown",
    });
    res.status(201).json(log);
  });
}
