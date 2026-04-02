import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import {
  createTeleconsultaSchema,
  updateTeleconsultaSchema,
  startSessionSchema,
  endSessionSchema,
  addNotesSchema,
  addPrescriptionSchema,
} from "./schemas";

export class TeleodontoController {
  async listTeleconsultas(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { status, dentist_id } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (status) where.status = String(status);
      if (dentist_id) where.dentist_id = String(dentist_id);
      const data = await (prisma as any).teleconsultas.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { data_agendada: "desc" },
        take: 1000,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing teleconsultas", { error });
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
      const data = await (prisma as any).teleconsultas.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!data) {
        res.status(404).json({ error: "Teleconsulta not found" });
        return;
      }
      res.json(data);
    } catch (error) {
      logger.error("Error getting teleconsulta", { error });
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
      const parsed = createTeleconsultaSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).teleconsultas.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId, status: parsed.data.status || "AGENDADO" },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating teleconsulta", { error });
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
      const existing = await (prisma as any).teleconsultas.findFirst({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) {
        res.status(404).json({ error: "Teleconsulta not found" });
        return;
      }
      const parsed = updateTeleconsultaSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating teleconsulta", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Session Management ---

  async startSession(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = startSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const teleconsulta = await (prisma as any).teleconsultas.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.teleconsulta_id, clinic_id: clinicId },
      });
      if (!teleconsulta) {
        res.status(404).json({ error: "Teleconsulta not found" });
        return;
      }

      const data = await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.teleconsulta_id },
        data: {
          status: "EM_ANDAMENTO",
          started_at: new Date().toISOString(),
        },
      });

      logger.info("Teleconsulta session started", {
        clinicId,
        teleconsultaId: parsed.data.teleconsulta_id,
      });

      res.json({ ...data, message: "Session started successfully" });
    } catch (error) {
      logger.error("Error starting teleconsulta session", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async endSession(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = endSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const teleconsulta = await (prisma as any).teleconsultas.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.teleconsulta_id, clinic_id: clinicId },
      });
      if (!teleconsulta) {
        res.status(404).json({ error: "Teleconsulta not found" });
        return;
      }

      const updateData: Record<string, unknown> = {
        status: "CONCLUIDO",
        ended_at: new Date().toISOString(),
        duracao_minutos: parsed.data.duration_minutes,
      };
      if (parsed.data.notes) {
        updateData.observacoes = parsed.data.notes;
      }

      const data = await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.teleconsulta_id },
        data: updateData,
      });

      logger.info("Teleconsulta session ended", {
        clinicId,
        teleconsultaId: parsed.data.teleconsulta_id,
        durationMinutes: parsed.data.duration_minutes,
      });

      res.json({ ...data, message: "Session ended successfully" });
    } catch (error) {
      logger.error("Error ending teleconsulta session", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Clinical notes ---
  async addNotes(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = addNotesSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const teleconsulta = await (prisma as any).teleconsultas.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.teleconsulta_id, clinic_id: clinicId },
      });
      if (!teleconsulta) {
        res.status(404).json({ error: "Teleconsulta not found" });
        return;
      }

      const data = await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.teleconsulta_id },
        data: {
          observacoes: parsed.data.notes,
          diagnosis: parsed.data.diagnosis,
          recommendations: parsed.data.recommendations,
        },
      });

      res.json(data);
    } catch (error) {
      logger.error("Error adding teleconsulta notes", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Prescriptions ---
  async addPrescription(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = addPrescriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const teleconsulta = await (prisma as any).teleconsultas.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.teleconsulta_id, clinic_id: clinicId },
      });
      if (!teleconsulta) {
        res.status(404).json({ error: "Teleconsulta not found" });
        return;
      }

      // Store prescription as JSON in the teleconsulta record
      const prescription = {
        prescribed_at: new Date().toISOString(),
        prescribed_by: req.user?.id,
        patient_id: parsed.data.patient_id,
        medications: parsed.data.medications,
        observations: parsed.data.observations,
      };

      const data = await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.teleconsulta_id },
        data: {
          prescricao: JSON.stringify(prescription),
        },
      });

      logger.info("Prescription added to teleconsulta", {
        clinicId,
        teleconsultaId: parsed.data.teleconsulta_id,
        medicationsCount: parsed.data.medications.length,
      });

      res.json({ ...data, prescription });
    } catch (error) {
      logger.error("Error adding prescription", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
