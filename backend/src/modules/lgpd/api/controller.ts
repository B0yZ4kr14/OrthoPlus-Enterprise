import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import {
  createConsentimentoSchema,
  createSolicitacaoSchema,
  updateSolicitacaoSchema,
} from "./schemas";

export class LGPDController {
  // --- Consentimentos ---
  async listConsentimentos(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const { patient_id } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (patient_id) where.patient_id = String(patient_id);
    const data = await prisma.lgpd_data_consents.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    res.json(data);
  }

  async createConsentimento(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const parsed = createConsentimentoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const data = await prisma.lgpd_data_consents.create({
      data: { ...parsed.data, clinic_id: clinicId },
    });
    res.status(201).json(data);
  }

  // --- Solicitações ---
  async listSolicitacoes(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await prisma.lgpd_data_requests.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    res.json(data);
  }

  async createSolicitacao(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const parsed = createSolicitacaoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const data = await prisma.lgpd_data_requests.create({
      data: { ...parsed.data, clinic_id: clinicId, requested_at: new Date().toISOString(), requested_by: req.user?.id || "system", status: parsed.data.status || "PENDENTE" },
    });
    res.status(201).json(data);
  }

  async updateSolicitacao(req: Request, res: Response) {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const { id } = req.params;
    const existing = await prisma.lgpd_data_requests.findFirst({
      where: { id, clinic_id: clinicId },
    });
    if (!existing) {
      res.status(404).json({ error: "Solicitação not found" });
      return;
    }
    const parsed = updateSolicitacaoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const data = await prisma.lgpd_data_requests.update({
      where: { id },
      data: parsed.data,
    });
    res.json(data);
  }
}
