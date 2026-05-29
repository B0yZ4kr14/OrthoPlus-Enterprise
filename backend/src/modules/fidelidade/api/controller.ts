import { Request, Response } from "express";
import { z } from "zod";
import { Errors } from "@/middleware/errorHandler";
import { IFidelidadeRepository } from "@/modules/fidelidade/domain/repositories/IFidelidadeRepository";
import { FidelidadeRepository } from "@/modules/fidelidade/infrastructure/FidelidadeRepository";

const addPointsSchema = z.object({
  patient_id: z.string().uuid(),
  pontos: z.number().int().positive(),
  descricao: z.string().max(500).optional(),
  referencia_id: z.string().uuid().optional().nullable(),
  referencia_tipo: z.string().max(100).optional().nullable(),
});

const createBadgeSchema = z.object({
  nome: z.string().min(1).max(200),
  descricao: z.string().max(1000).optional(),
  icone_url: z.string().url().optional().nullable(),
  pontos_necessarios: z.number().int().nonnegative(),
  is_active: z.boolean().optional(),
});

const createRecompensaSchema = z.object({
  nome: z.string().min(1).max(200),
  descricao: z.string().max(1000).optional(),
  pontos_necessarios: z.number().int().nonnegative(),
  valor_desconto: z.number().nonnegative().optional().nullable(),
  tipo: z.string().max(100).optional(),
  ativo: z.boolean().optional(),
});

const createIndicacaoSchema = z.object({
  referrer_id: z.string().uuid(),
  referred_patient_id: z.string().uuid(),
  status: z.string().max(100).optional(),
  pontos_concedidos: z.number().int().nonnegative().optional(),
});

export class FidelidadeController {
  constructor(
    private repo: IFidelidadeRepository = new FidelidadeRepository(),
  ) {}

  async getPoints(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { patient_id } = req.query;
    const data = await this.repo.findPontosByClinic(
      clinicId,
      patient_id ? String(patient_id) : undefined,
    );
    res.json(data);
  }

  async addPoints(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = addPointsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }

    const { patient_id, pontos } = parsed.data;

    const [pointRecord, , unlockedBadges] =
      await this.repo.addPointsTransaction(
        clinicId,
        patient_id,
        pontos,
        parsed.data,
      );

    const patientRecord = await this.repo.findPacienteFidelidade(
      clinicId,
      patient_id,
    );
    const totalPoints = patientRecord?.pontos_acumulados || pontos;
    const newlyUnlocked = (unlockedBadges || []).filter(
      (badge: { pontos_necessarios: number }) =>
        totalPoints >= badge.pontos_necessarios,
    );

    res.status(201).json({
      ...pointRecord,
      pontos_acumulados: totalPoints,
      badges_desbloqueados:
        newlyUnlocked.length > 0 ? newlyUnlocked : undefined,
    });
  }

  async listBadges(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await this.repo.findAllBadgesByClinic(clinicId);
    res.json(data);
  }

  async createBadge(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createBadgeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createBadge({
      ...parsed.data,
      clinic_id: clinicId,
    });
    res.status(201).json(data);
  }

  async listRecompensas(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { ativo } = req.query;
    const data = await this.repo.findRecompensasByClinic(
      clinicId,
      ativo !== undefined ? ativo === "true" : undefined,
    );
    res.json(data);
  }

  async createRecompensa(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createRecompensaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createRecompensa({
      ...parsed.data,
      clinic_id: clinicId,
    });
    res.status(201).json(data);
  }

  async listIndicacoes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { referrer_id } = req.query;
    const data = await this.repo.findIndicacoesByClinic(
      clinicId,
      referrer_id ? String(referrer_id) : undefined,
    );
    res.json(data);
  }

  async createIndicacao(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createIndicacaoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.repo.createIndicacao({
      ...parsed.data,
      clinic_id: clinicId,
    });
    res.status(201).json(data);
  }
}
