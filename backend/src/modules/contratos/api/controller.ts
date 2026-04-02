import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { createContratoSchema, updateContratoSchema } from "./schemas";

export class ContratosController {
  async list(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const data = await (prisma as any).contratos.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing contratos", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const data = await (prisma as any).contratos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!data) {
        res.status(404).json({ error: "Contrato not found" });
        return;
      }
      res.json(data);
    } catch (error) {
      logger.error("Error getting contrato", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createContratoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).contratos.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating contrato", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).contratos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Contrato not found" });
        return;
      }
      const parsed = updateContratoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).contratos.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating contrato", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).contratos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Contrato not found" });
        return;
      }
      await (prisma as any).contratos.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting contrato", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async listTemplates(_req: Request, res: Response) {
    try {
      const data = await (prisma as any).contrato_templates.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        orderBy: { nome: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing contrato templates", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
