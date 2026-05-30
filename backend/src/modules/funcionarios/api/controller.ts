import { Request, Response } from "express";
import { createFuncionarioSchema, updateFuncionarioSchema } from "./schemas";
import { IFuncionarioRepository } from "../domain/repositories/IFuncionarioRepository";
import { FuncionarioRepository } from "../infrastructure/FuncionarioRepository";

export class FuncionariosController {
  constructor(
    private repo: IFuncionarioRepository = new FuncionarioRepository(),
  ) {}

  async list(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const data = await this.repo.findManyByClinic(clinicId as string);
    res.json(data);
  }

  async getById(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const { id } = req.params;
    const data = await this.repo.findById(id, clinicId as string);
    if (!data) {
      res.status(404).json({ error: "Funcionário not found" });
      return;
    }
    res.json(data);
  }

  async create(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const parsed = createFuncionarioSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const data = await this.repo.create({
      ...parsed.data,
      clinic_id: clinicId as string,
    });
    res.status(201).json(data);
  }

  async update(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const { id } = req.params;
    const parsed = updateFuncionarioSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const data = await this.repo.update(id, parsed.data);
    res.json(data);
  }

  async delete(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const { id } = req.params;
    await this.repo.delete(id);
    res.status(204).send();
  }
}
