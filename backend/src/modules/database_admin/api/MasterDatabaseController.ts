import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { MasterDatabaseControllerService } from "@/modules/database_admin/application/MasterDatabaseControllerService";

export class MasterDatabaseController {
  private service = new MasterDatabaseControllerService();

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = await this.service.getCategories();
    res.json({ categories: result });
  });

  getMasterHealth = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = await this.service.getMasterHealth();
    res.json(result);
  });

  getMasterStats = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = await this.service.getMasterStats();
    res.json(result);
  });

  crossQuery = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = await this.service.crossQuery(req.body);
    res.json(result);
  });

  getCircuitMetrics = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = this.service.getCircuitMetrics();
    res.json(result);
  });

  resetCircuit = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const { category } = req.params;
    const result = this.service.resetCircuit(category);
    res.json(result);
  });

  getBackupStatus = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = await this.service.getBackupStatus();
    res.json(result);
  });

  executeBackup = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const { category } = req.params;
    const result = await this.service.executeBackup(category, req.body);
    res.json(result);
  });
}
