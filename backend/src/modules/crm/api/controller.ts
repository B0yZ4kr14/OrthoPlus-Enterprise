import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { createLeadSchema, updateLeadSchema } from "./schemas";

export class CRMController {
  async listLeads(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { status } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (status) where.status = String(status);
      const data = await (prisma as any).crm_leads.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing CRM leads", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getLeadById(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const data = await (prisma as any).crm_leads.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!data) {
        res.status(404).json({ error: "Lead not found" });
        return;
      }
      res.json(data);
    } catch (error) {
      logger.error("Error getting CRM lead", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createLead(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).crm_leads.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating CRM lead", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateLead(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).crm_leads.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Lead not found" });
        return;
      }
      const parsed = updateLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).crm_leads.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating CRM lead", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteLead(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).crm_leads.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Lead not found" });
        return;
      }
      await (prisma as any).crm_leads.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting CRM lead", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
