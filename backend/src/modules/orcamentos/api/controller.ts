import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { createOrcamentoSchema, updateOrcamentoSchema, addItemSchema } from "./schemas";

export class OrcamentosController {
  async list(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { patient_id, status } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (patient_id) where.patient_id = String(patient_id);
      if (status) where.status = String(status);
      const data = await (prisma as any).orcamentos.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing orcamentos", { error });
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
      const data = await (prisma as any).orcamentos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!data) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      res.json(data);
    } catch (error) {
      logger.error("Error getting orcamento", { error });
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
      const parsed = createOrcamentoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).orcamentos.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating orcamento", { error });
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
      const existing = await (prisma as any).orcamentos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      const parsed = updateOrcamentoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).orcamentos.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating orcamento", { error });
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
      const existing = await (prisma as any).orcamentos.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      await (prisma as any).orcamentos.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting orcamento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Items ---
  async listItems(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { orcamento_id } = req.params;
      const data = await (prisma as any).orcamento_itens.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { orcamento_id, orcamento: { clinic_id: clinicId } },
        orderBy: { created_at: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing orcamento items", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { orcamento_id } = req.params;
      const orcamento = await (prisma as any).orcamentos.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: orcamento_id, clinic_id: clinicId },
      });
      if (!orcamento) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      const parsed = addItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).orcamento_itens.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, orcamento_id },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error adding orcamento item", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
