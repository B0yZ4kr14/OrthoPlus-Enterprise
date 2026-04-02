import { z } from 'zod';

export const createConsentimentoSchema = z.object({
  consent_type: z.string(),
  granted: z.boolean(),
  patient_id: z.string().uuid(),
  expires_at: z.string().optional(),
});

export const createSolicitacaoSchema = z.object({
  request_type: z.string(),
  patient_id: z.string().uuid(),
  status: z.string().optional(),
  description: z.string().optional(),
});

export const updateSolicitacaoSchema = z.object({
  status: z.string().optional(),
  completed_at: z.string().optional(),
  response: z.string().optional(),
  responded_by: z.string().uuid().optional(),
});
