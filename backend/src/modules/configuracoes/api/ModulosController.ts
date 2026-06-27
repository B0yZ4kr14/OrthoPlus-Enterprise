import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { ModulosControllerService } from "@/modules/configuracoes/application/ModulosControllerService";

export class ModulosController {
  private service = new ModulosControllerService();

  getMyModules = (_req: Request, res: Response) => {
    res.json({ modules: this.service.getMyModules() });
  };

  getModulesForClinic = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("clinicId is required");
    }
    const modules = await this.service.getModulesForClinic(clinicId);
    res.json({ modules });
  });

  getDependencies = (_req: Request, res: Response) => {
    res.json({ dependencies: this.service.getDependencies() });
  };

  toggleModuleByKey = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("clinicId is required");
    }
    const { module_key, enabled } = req.body as {
      module_key?: string;
      enabled?: boolean;
    };
    if (!module_key) {
      throw Errors.validation("module_key is required");
    }
    if (typeof enabled !== "boolean") {
      throw Errors.validation("enabled must be a boolean");
    }
    const result = await this.service.toggleModule(
      clinicId,
      module_key,
      enabled,
    );
    res.json(result);
  });

  toggleModuleState = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("clinicId is required");
    }
    const moduleId = parseInt(req.params.id, 10);
    const { enabled } = req.body as { enabled?: boolean };
    if (Number.isNaN(moduleId)) {
      throw Errors.validation("id must be a number");
    }
    if (typeof enabled !== "boolean") {
      throw Errors.validation("enabled must be a boolean");
    }
    const result = await this.service.toggleModuleById(
      clinicId,
      moduleId,
      enabled,
    );
    res.json(result);
  });

  applyModuleTemplate = asyncHandler(async (_req: Request, res: Response) => {
    const result = this.service.applyModuleTemplate();
    res.status(200).json(result);
  });

  suggestModules = asyncHandler(async (_req: Request, res: Response) => {
    const result = this.service.suggestModules();
    res.status(200).json(result);
  });

  recommendModuleSequence = asyncHandler(
    async (_req: Request, res: Response) => {
      const result = this.service.recommendModuleSequence();
      res.status(200).json(result);
    },
  );

  importClinicData = asyncHandler(async (req: Request, res: Response) => {
    const { data } = req.body as { data: unknown[] };
    if (!data) {
      throw Errors.validation("No data provided");
    }
    const result = this.service.importClinicData(data);
    res.status(200).json(result);
  });

  exportClinicData = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw Errors.unauthorized("Unauthorized");
    }
    const result = await this.service.exportClinicData(user.clinicId);
    res.status(200).json(result);
  });
}
