import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { createFuncionarioSchema, updateFuncionarioSchema } from "./schemas";

export class FuncionariosController {
  async list(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const data = await (prisma as any).funcionarios.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
        orderBy: { nome: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing funcionarios", { error });
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
      const data = await (prisma as any).funcionarios.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!data) {
        res.status(404).json({ error: "Funcionário not found" });
        return;
      }
      res.json(data);
    } catch (error) {
      logger.error("Error getting funcionario", { error });
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
      const parsed = createFuncionarioSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).funcionarios.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating funcionario", { error });
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
      const existing = await (prisma as any).funcionarios.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Funcionário not found" });
        return;
      }
      const parsed = updateFuncionarioSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).funcionarios.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating funcionario", { error });
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
      const existing = await (prisma as any).funcionarios.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Funcionário not found" });
        return;
      }
      await (prisma as any).funcionarios.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting funcionario", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
