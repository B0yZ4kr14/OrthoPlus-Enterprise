import { clinicGuard } from "@/middleware/clinicGuard";
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
router.use(clinicGuard);
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

  // Odontogramas — UPDATE (PUT, PATCH)
  const updateOdontograma = async (req: Request, res: Response) => {
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
  };
  router.put('/odontogramas/:id', updateOdontograma);
  router.patch('/odontogramas/:id', updateOdontograma);

  // Odontogramas — DELETE
  router.delete('/odontogramas/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const existing = await (prisma as any).odontogramas.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) return res.status(404).json({ error: 'Odontograma not found' });
      await (prisma as any).odontogramas.delete({ where: { id: req.params.id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting odontograma', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ---------------------------------------------------------------------------
  // Prontuarios — UPDATE / DELETE (Wave-2 fix: previously missing)
  // ---------------------------------------------------------------------------
  router.patch('/prontuarios/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const existing = await (prisma as any).prontuarios.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) return res.status(404).json({ error: 'Prontuario not found' });
      const data = await (prisma as any).prontuarios.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id },
        data: req.body,
      });
      return res.json(data);
    } catch (error) {
      logger.error('Error updating prontuario', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.delete('/prontuarios/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const existing = await (prisma as any).prontuarios.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) return res.status(404).json({ error: 'Prontuario not found' });
      await (prisma as any).prontuarios.delete({ where: { id: req.params.id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting prontuario', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ---------------------------------------------------------------------------
  // Anexos (pep_anexos) — CRUD
  // ---------------------------------------------------------------------------
  router.post('/anexos', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const data = await (prisma as any).pep_anexos.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...req.body, clinic_id: clinicId },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error('Error creating anexo', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/anexos/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const data = await (prisma as any).pep_anexos.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id },
        data: req.body,
      });
      return res.json(data);
    } catch (error) {
      logger.error('Error updating anexo', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.delete('/anexos/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      await (prisma as any).pep_anexos.delete({ where: { id: req.params.id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting anexo', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ---------------------------------------------------------------------------
  // Evolucoes (pep_evolucoes) — CRUD
  // ---------------------------------------------------------------------------
  router.post('/evolucoes', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const data = await (prisma as any).pep_evolucoes.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...req.body, created_by: req.user?.id || 'system' },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error('Error creating evolucao', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/evolucoes/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const data = await (prisma as any).pep_evolucoes.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id },
        data: req.body,
      });
      return res.json(data);
    } catch (error) {
      logger.error('Error updating evolucao', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.delete('/evolucoes/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      await (prisma as any).pep_evolucoes.delete({ where: { id: req.params.id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting evolucao', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ---------------------------------------------------------------------------
  // Tratamentos (pep_tratamentos) — CRUD
  // ---------------------------------------------------------------------------
  router.post('/tratamentos', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const data = await (prisma as any).pep_tratamentos.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...req.body, created_by: req.user?.id || 'system' },
      });
      return res.status(201).json(data);
    } catch (error) {
      logger.error('Error creating tratamento', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/tratamentos/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const data = await (prisma as any).pep_tratamentos.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id },
        data: req.body,
      });
      return res.json(data);
    } catch (error) {
      logger.error('Error updating tratamento', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.delete('/tratamentos/:id', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      await (prisma as any).pep_tratamentos.delete({ where: { id: req.params.id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting tratamento', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ---------------------------------------------------------------------------
  // Odontograma data — tooth / surface / delete (Wave-2 fix)
  // ---------------------------------------------------------------------------
  router.put('/odontogramas/data/tooth', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const { prontuario_id, tooth_number, status: toothStatus, notes } = req.body;
      const existing = await (prisma as any).pep_odontograma_data.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { prontuario_id, tooth_number },
      });
      let data;
      if (existing) {
        data = await (prisma as any).pep_odontograma_data.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
          where: { id: existing.id },
          data: { status: toothStatus, notes, updated_by: req.user?.id || 'system' },
        });
      } else {
        data = await (prisma as any).pep_odontograma_data.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
          data: { prontuario_id, tooth_number, status: toothStatus, notes, created_by: req.user?.id || 'system' },
        });
      }
      return res.json(data);
    } catch (error) {
      logger.error('Error updating odontograma tooth data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/odontogramas/data/surface', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const { odontograma_data_id, surface, status: surfaceStatus } = req.body;
      const existing = await (prisma as any).pep_tooth_surfaces.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { odontograma_data_id, surface },
      });
      let data;
      if (existing) {
        data = await (prisma as any).pep_tooth_surfaces.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
          where: { id: existing.id },
          data: { status: surfaceStatus },
        });
      } else {
        data = await (prisma as any).pep_tooth_surfaces.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
          data: { odontograma_data_id, surface, status: surfaceStatus },
        });
      }
      return res.json(data);
    } catch (error) {
      logger.error('Error updating odontograma surface data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.delete('/odontogramas/data', async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: 'Missing clinic context' });
      const { id } = req.body;
      await (prisma as any).pep_odontograma_data.delete({ where: { id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting odontograma data', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
