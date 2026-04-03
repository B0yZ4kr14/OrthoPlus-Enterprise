import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PepController } from './PepController';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const odontogramaCreateSchema = z.object({
  patient_id: z.string().uuid(),
  odontograma_data: z.record(z.unknown()),
  observacoes: z.string().max(2000).optional().nullable(),
});

const odontogramaHistoryCreateSchema = z.object({
  patient_id: z.string().uuid(),
  odontograma_data: z.record(z.unknown()),
  observacoes: z.string().max(2000).optional().nullable(),
});

const odontogramaUpdateSchema = z.object({
  odontograma_data: z.record(z.unknown()).optional(),
  observacoes: z.string().max(2000).optional().nullable(),
});

export function createPepRouter(): Router {
  const router: Router = Router();
  const controller = new PepController();

  // Prontuarios
  router.post('/prontuarios', (req, res) => controller.createProntuario(req, res));
  router.get('/prontuarios/patient/:patientId', (req, res) => controller.listProntuariosByPatient(req, res));
  router.post('/prontuarios/:id/assinar', (req, res) => controller.assinarDigitalmente(req, res));

  // Odontogramas — GET by patient
  router.get('/odontogramas/patient/:patientId', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const data = await (prisma as any).odontogramas.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { patient_id: req.params.patientId, clinic_id: clinicId },
        orderBy: { updated_at: 'desc' },
      });
      if (!data) return res.status(404).json({ error: 'Odontograma not found for this patient' });
      return res.json(data);
    } catch (error) {
      logger.error('Error getting odontograma by patient', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Odontogramas — GET by id
  router.get('/odontogramas/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const data = await (prisma as any).odontogramas.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!data) return res.status(404).json({ error: 'Odontograma not found' });
      return res.json(data);
    } catch (error) {
      logger.error('Error getting odontograma', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Odontogramas — CREATE (upsert per patient)
  router.post('/odontogramas', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const parsed = odontogramaCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      }

      // Check if odontograma already exists for this patient in this clinic
      const existing = await (prisma as any).odontogramas.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { patient_id: parsed.data.patient_id, clinic_id: clinicId },
      });

      let data;
      if (existing) {
        // Update existing
        data = await (prisma as any).odontogramas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
          where: { id: existing.id },
          data: {
            odontograma_data: parsed.data.odontograma_data,
            observacoes: parsed.data.observacoes,
          },
        });
      } else {
        // Create new
        data = await (prisma as any).odontogramas.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
          data: { ...parsed.data, clinic_id: clinicId },
        });
      }

      // Also save a history snapshot
      await (prisma as any).pep_odontograma_history.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: {
          patient_id: parsed.data.patient_id,
          clinic_id: clinicId,
          odontograma_data: parsed.data.odontograma_data,
          observacoes: parsed.data.observacoes,
        },
      });

      return res.status(existing ? 200 : 201).json(data);
    } catch (error) {
      logger.error('Error creating/updating odontograma', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Odontograma history — GET (with LIMIT)
  router.get('/odontogramas/history', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const { patient_id } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (patient_id) where.patient_id = String(patient_id);
      const data = await (prisma as any).pep_odontograma_history.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: 'desc' },
        take: 100,
      });
      return res.json(data);
    } catch (error) {
      logger.error('Error getting odontograma history', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Odontograma history — POST
  router.post('/odontogramas/history', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const parsed = odontogramaHistoryCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      }
      const data = await (prisma as any).pep_odontograma_history.create({ data: { ...parsed.data, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(201).json(data);
    } catch (error) {
      logger.error('Error creating odontograma history', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Odontogramas — UPDATE
  router.put('/odontogramas/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const existing = await (prisma as any).odontogramas.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) return res.status(404).json({ error: 'Odontograma not found' });
      const parsed = odontogramaUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      }
      const data = await (prisma as any).odontogramas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id },
        data: parsed.data,
      });
      return res.json(data);
    } catch (error) {
      logger.error('Error updating odontograma', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
