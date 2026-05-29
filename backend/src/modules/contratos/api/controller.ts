import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import { IContratosRepository } from "@/modules/contratos/domain/repositories/IContratosRepository";
import { createContratoSchema, updateContratoSchema } from "./schemas";

import { ContratosRepository } from "@/modules/contratos/infrastructure/ContratosRepository";

export class ContratosController {
  private repo: IContratosRepository;

  constructor(repo?: IContratosRepository) {
    this.repo = repo ?? new ContratosRepository();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await this.repo.listContratos(clinicId);
    res.json(data);
    return;
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await this.repo.getContratoById(id, clinicId);
    if (!data) {
      throw Errors.notFound("Contrato", id);
    }
    res.json(data);
    return;
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createContratoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createContrato({
      ...parsed.data,
      clinic_id: clinicId,
    } as any);
    res.status(201).json(data);
    return;
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.getContratoById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Contrato", id);
    }
    const parsed = updateContratoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.updateContrato(id, parsed.data as any);
    res.json(data);
    return;
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await this.repo.getContratoById(id, clinicId);
    if (!existing) {
      throw Errors.notFound("Contrato", id);
    }
    await this.repo.deleteContrato(id);
    res.status(204).send();
    return;
  });

  listTemplates = asyncHandler(async (_req: Request, res: Response) => {
    const data = await this.repo.listTemplates();
    res.json(data);
    return;
  });
}
