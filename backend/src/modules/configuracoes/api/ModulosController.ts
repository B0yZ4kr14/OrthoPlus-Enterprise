import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { ModulosControllerService } from "@/modules/configuracoes/application/ModulosControllerService";

export class ModulosController {
  private service = new ModulosControllerService();

  getMyModules = (_req: Request, res: Response) => {
    res.json({ modules: this.service.getMyModules() });
  };

  getDependencies = (_req: Request, res: Response) => {
    res.json({ dependencies: this.service.getDependencies() });
  };

  toggleModuleByKey = (req: Request, res: Response) => {
    const { module_key } = req.body as { module_key?: string };
    if (!module_key) {
      throw Errors.validation("module_key is required");
    }
    try {
      const result = this.service.toggleModule(module_key);
      res.json(result);
    } catch (err: any) {
      if (err.message?.startsWith("Dependencias")) {
        res.status(412).json({ error: err.message });
      } else if (err.message?.startsWith("Modulo tem dependentes")) {
        res.status(412).json({ error: err.message });
      } else {
        res.status(404).json({ error: err.message });
      }
    }
  };

  toggleModuleState = (req: Request, res: Response) => {
    const moduleId = parseInt(req.params.id, 10);
    try {
      const result = this.service.toggleModuleById(moduleId);
      res.json(result);
    } catch (err: any) {
      if (err.message?.startsWith("Dependencias")) {
        res.status(412).json({ error: err.message });
      } else if (err.message?.startsWith("Modulo tem dependentes")) {
        res.status(412).json({ error: err.message });
      } else {
        res.status(404).json({ error: err.message });
      }
    }
  };

  applyModuleTemplate = asyncHandler(async (_req: Request, res: Response) => {
    const result = this.service.applyModuleTemplate();
    res.status(200).json(result);
  });

  suggestModules = asyncHandler(async (_req: Request, res: Response) => {
    const result = this.service.suggestModules();
    res.status(200).json(result);
  });

  recommendModuleSequence = asyncHandler(async (_req: Request, res: Response) => {
    const result = this.service.recommendModuleSequence();
    res.status(200).json(result);
  });

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
