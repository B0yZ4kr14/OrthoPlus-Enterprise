import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import {
  OrcamentoService,
  CreateOrcamentoInput,
  AddItemInput,
} from "../application/services/OrcamentoService";
import {
  createOrcamentoSchema,
  updateOrcamentoSchema,
  addItemSchema,
} from "./schemas";
import { Errors, ApiError } from "@/middleware/errorHandler";

export class OrcamentosController {
  private service: OrcamentoService;

  constructor() {
    this.service = new OrcamentoService();
  }

  async list(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { patient_id, status } = req.query;
    const filters = {
      ...(patient_id && { patient_id: String(patient_id) }),
      ...(status && { status: String(status) }),
    };
    const data = await this.service.list(clinicId, filters);
    return res.json(data);
  }

  async getById(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await this.service.getById(id, clinicId);
    if (!data) {
      throw Errors.notFound("Orçamento", id);
    }
    return res.json(data);
  }

  async create(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    const createdBy = req.user?.id;
    if (!clinicId || !createdBy) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createOrcamentoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.service.create(
      { ...parsed.data, created_by: createdBy } as CreateOrcamentoInput,
      clinicId,
    );
    return res.status(201).json(data);
  }

  async update(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const parsed = updateOrcamentoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.service.update(id, parsed.data, clinicId);
    if (!data) {
      throw Errors.notFound("Orçamento", id);
    }
    return res.json(data);
  }

  async delete(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const deleted = await this.service.delete(id, clinicId);
    if (!deleted) {
      throw Errors.notFound("Orçamento", id);
    }
    return res.status(204).send();
  }

  // --- Ações de workflow ---
  async enviar(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    try {
      const data = await this.service.enviar(id, clinicId);
      if (!data) {
        throw Errors.notFound("Orçamento", id);
      }
      return res.json(data);
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const msg =
        error instanceof Error ? error.message : "Internal server error";
      logger.error("Error enviando orcamento", { error });
      throw Errors.validation(msg);
    }
  }

  async aprovar(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    const aprovadoPor = req.user?.id;
    if (!clinicId || !aprovadoPor) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    try {
      const data = await this.service.aprovar(id, aprovadoPor, clinicId);
      if (!data) {
        throw Errors.notFound("Orçamento", id);
      }
      return res.json(data);
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const msg =
        error instanceof Error ? error.message : "Internal server error";
      logger.error("Error aprovando orcamento", { error });
      throw Errors.validation(msg);
    }
  }

  async rejeitar(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    const rejeitadoPor = req.user?.id;
    if (!clinicId || !rejeitadoPor) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const { motivo } = req.body;
    if (!motivo || typeof motivo !== "string") {
      throw Errors.validation("Motivo de rejeição é obrigatório");
    }
    try {
      const data = await this.service.rejeitar(
        id,
        rejeitadoPor,
        motivo,
        clinicId,
      );
      if (!data) {
        throw Errors.notFound("Orçamento", id);
      }
      return res.json(data);
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const msg =
        error instanceof Error ? error.message : "Internal server error";
      logger.error("Error rejeitando orcamento", { error });
      throw Errors.validation(msg);
    }
  }

  // --- Items ---
  async listItems(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { orcamento_id } = req.params;
    const data = await this.service.listItems(orcamento_id, clinicId);
    return res.json(data);
  }

  async addItem(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { orcamento_id } = req.params;
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.service.addItem(
      orcamento_id,
      parsed.data as AddItemInput,
      clinicId,
    );
    if (!data) {
      throw Errors.notFound("Orçamento", orcamento_id);
    }
    return res.status(201).json(data);
  }
}
