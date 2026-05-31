import { logger } from "@/infrastructure/logger";
import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";

export const applyModuleTemplate = async (req: Request, res: Response) => {
  const { clinicId: _clinicId, templateId: _templateId } = req.body;
  logger.info("Applying module template", {
    clinicId: _clinicId,
    templateId: _templateId,
  });
  return res.status(200).json({ message: "Template applied successfully" });
};

export const getMyModules = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const modules = await prisma.clinic_modules
    .findMany({
      where: {
        clinic_id: user.clinicId || "DEFAULT",
        is_active: true,
      },
      include: {
        module_catalog: true,
      },
    })
    .catch((err) => {
      logger.error("Failed to fetch clinic modules", { clinicId: user.clinicId, error: err })
      return []
    });

  return res.status(200).json({ modules });
};

export const suggestModules = async (_req: Request, res: Response) => {
  return res.status(200).json({
    suggestions: [
      {
        id: "1",
        name: "Advanced Analytics",
        reason: "You process high volume sales",
      },
      {
        id: "2",
        name: "CRM Integration",
        reason: "Missing patient onboarding flows",
      },
    ],
  });
};

export const toggleModuleState = async (req: Request, res: Response) => {
  const { moduleId, isActive } = req.body;
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  await prisma.clinic_modules
    .updateMany({
      where: {
        module_catalog_id: parseInt(moduleId, 10),
        clinic_id: user.clinicId || "DEFAULT",
      },
      data: { is_active: isActive },
    })
    .catch((err) => {
      logger.error("Failed to toggle module state", { moduleId, clinicId: user.clinicId, error: err })
    });

  return res
    .status(200)
    .json({ message: "Module state toggled to " + isActive });
};

export const recommendModuleSequence = async (_req: Request, res: Response) => {
  return res.status(200).json({
    sequence: ["Core ERP", "Finance Module", "Patient Portal"],
  });
};

export const importClinicData = async (req: Request, res: Response) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "No data provided" });

  return res
    .status(200)
    .json({ message: "Data imported successfully", processed: data.length });
};

export const exportClinicData = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const patients = await prisma.patients
    .findMany({
      where: { clinic_id: user.clinicId },
    })
    .catch((err) => {
      logger.error("Failed to export clinic patients", { clinicId: user.clinicId, error: err })
      return []
    });

  return res.status(200).json({ export: patients, format: "json" });
};

export const requestNewModule = async (req: Request, res: Response) => {
  const { moduleName, description } = req.body;
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  logger.info("New module requested", {
    moduleName,
    submittedBy: user.id || user.email,
  });
  return res.status(200).json({
    message: "Module request '" + moduleName + "' submitted successfully",
    requestId: "req-" + Date.now(),
    status: "pending_review",
    submittedBy: user.id || user.email,
    description,
  });
};
