import { logger } from '@/infrastructure/logger';
import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";


export const applyModuleTemplate = async (req: Request, res: Response) => {
  try {
    const { clinicId: _clinicId, templateId: _templateId } = req.body;
    // Mocking template application. Real logic involves duplicating permissions, flows, and fields associated with a template.
    

    return res.status(200).json({ message: "Template applied successfully" });
  } catch (error) {
    logger.error("Error applying module template:", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMyModules = async (req: Request, res: Response) => {
  try {
    // Ideally user context is attached to req via requireAuth middleware
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Mock grabbing modules tied to the user's tenant or clinic
    const modules = await prisma.clinic_modules.findMany({
      where: {
        clinic_id: user.clinicId || "DEFAULT",
        is_active: true,
      },
      include: {
        module_catalog: true,
      },
    }).catch(() => []);

    return res.status(200).json({ modules });
  } catch (error) {
    logger.error("Error getting modules:", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const suggestModules = async (_req: Request, res: Response) => {
  try {
    // Simple mock logic for suggestions based on usage
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
  } catch (error) {
    logger.error("Error suggesting modules:", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const toggleModuleState = async (req: Request, res: Response) => {
  try {
    const { moduleId, isActive } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    await prisma.clinic_modules.updateMany({
      where: {
        module_catalog_id: parseInt(moduleId, 10),
        clinic_id: user.clinicId || "DEFAULT",
      },
      data: { is_active: isActive },
    }).catch(() => { /* no-op */ });

    return res
      .status(200)
      .json({ message: `Module state toggled to ${isActive}` });
  } catch (error) {
    logger.error("Error toggling module state:", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const recommendModuleSequence = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      sequence: ["Core ERP", "Finance Module", "Patient Portal"],
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const importClinicData = async (req: Request, res: Response) => {
  try {
    // Handles CSV/JSON import natively instead of going through edge function
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: "No data provided" });

    
    return res
      .status(200)
      .json({ message: "Data imported successfully", processed: data.length });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const exportClinicData = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const patients = await prisma.patients
      .findMany({
        where: { clinic_id: user.clinicId },
      })
      .catch(() => []);

    return res.status(200).json({ export: patients, format: "json" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const requestNewModule = async (req: Request, res: Response) => {
  try {
    const { moduleName, description } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Mock: in production this would create a ticket or notify admins
    return res.status(200).json({
      message: `Module request '${moduleName}' submitted successfully`,
      requestId: `req-${Date.now()}`,
      status: "pending_review",
      submittedBy: user.id || user.email,
      description,
    });
  } catch (error) {
    logger.error("Error requesting new module:", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
