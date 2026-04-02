import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@/infrastructure/logger';


const createProntuarioSchema = z.object({
  patientId: z.string().uuid(),
  dentistaId: z.string().uuid(),
  dataConsulta: z.string().datetime(),
  motivoConsulta: z.string().min(3),
  anamnese: z.string().optional(),
  exameFisico: z.string().optional(),
  diagnostico: z.string().optional(),
  planoDeTratamento: z.string().optional(),
  observacoes: z.string().optional(),
});

export class PepController {
  async createProntuario(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createProntuarioSchema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: 'Clinic ID not found in token' });
        return;
      }

      const prontuario = await prisma.prontuarios.create({
        data: {
          clinic_id: clinicId,
          patient_id: validatedData.patientId,
          patient_name: `Paciente ${validatedData.patientId}`, // Mocked name mapping
          created_by: req.user?.id || 'system',
        }
      });
      
      logger.info('Prontuario created', { clinicId, patientId: validatedData.patientId, prontuarioId: prontuario.id });
      res.status(201).json({ message: 'Prontuario created successfully', prontuario });
    } catch (error) {
      logger.error('Error creating prontuario', { error });
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listProntuariosByPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: 'Clinic ID not found in token' });
        return;
      }

      const prontuarios = await prisma.prontuarios.findMany({
        where: {
          clinic_id: clinicId,
          patient_id: patientId
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      logger.info('Listing prontuarios', { clinicId, patientId });
      res.status(200).json({ prontuarios });
    } catch (error) {
      logger.error('Error listing prontuarios', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async assinarDigitalmente(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { hash } = req.body;

      if (!hash) {
        res.status(400).json({ error: 'Hash is required' });
        return;
      }

      const assinatura = await prisma.pep_assinaturas.create({
        data: {
          prontuario_id: id,
          assinatura_base64: hash,
          signed_at: new Date().toISOString(),
          signed_by: req.user?.id || 'system',
          tipo_documento: 'PRONTUARIO_EVOLUCAO',
          ip_address: req.ip || '',
          user_agent: req.headers['user-agent'] || ''
        }
      });

      logger.info('Prontuario digitally signed', { id, assinaturaId: assinatura.id });
      res.status(200).json({ message: 'Prontuario signed successfully', assinatura });
    } catch (error) {
      logger.error('Error signing prontuario', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
