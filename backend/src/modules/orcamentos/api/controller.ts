import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { OrcamentoService, CreateOrcamentoInput, AddItemInput } from "../application/services/OrcamentoService";
import { createOrcamentoSchema, updateOrcamentoSchema, addItemSchema } from "./schemas";

export class OrcamentosController {
  private service: OrcamentoService;

  constructor() {
    this.service = new OrcamentoService();
  }

  async list(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { patient_id, status } = req.query;
      const filters = {
        ...(patient_id && { patient_id: String(patient_id) }),
        ...(status && { status: String(status) }),
      };
      const data = await this.service.list(clinicId, filters);
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
      const data = await this.service.getById(id, clinicId);
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
      const createdBy = req.user?.id;
      if (!clinicId || !createdBy) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createOrcamentoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await this.service.create({ ...parsed.data, created_by: createdBy } as CreateOrcamentoInput, clinicId);
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
      const parsed = updateOrcamentoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await this.service.update(id, parsed.data, clinicId);
      if (!data) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
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
      const deleted = await this.service.delete(id, clinicId);
      if (!deleted) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting orcamento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Ações de workflow ---
  async enviar(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const data = await this.service.enviar(id, clinicId);
      if (!data) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      res.json(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      logger.error("Error enviando orcamento", { error });
      res.status(400).json({ error: msg });
    }
  }

  async aprovar(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      const aprovadoPor = req.user?.id;
      if (!clinicId || !aprovadoPor) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const data = await this.service.aprovar(id, aprovadoPor, clinicId);
      if (!data) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      res.json(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      logger.error("Error aprovando orcamento", { error });
      res.status(400).json({ error: msg });
    }
  }

  async rejeitar(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      const rejeitadoPor = req.user?.id;
      if (!clinicId || !rejeitadoPor) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const { motivo } = req.body;
      if (!motivo || typeof motivo !== "string") {
        res.status(400).json({ error: "Motivo de rejeição é obrigatório" });
        return;
      }
      const data = await this.service.rejeitar(id, rejeitadoPor, motivo, clinicId);
      if (!data) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      res.json(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      logger.error("Error rejeitando orcamento", { error });
      res.status(400).json({ error: msg });
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
      const data = await this.service.listItems(orcamento_id, clinicId);
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
      const parsed = addItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await this.service.addItem(orcamento_id, parsed.data as AddItemInput, clinicId);
      if (!data) {
        res.status(404).json({ error: "Orçamento not found" });
        return;
      }
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error adding orcamento item", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
