import { z } from 'zod';

export const createTeleconsultaSchema = z.object({
  titulo: z.string().max(200),
  motivo: z.string().max(1000),
  tipo: z.string(),
  data_agendada: z.string(),
  patient_id: z.string().uuid(),
  dentist_id: z.string().uuid(),
  link_sala: z.string().url().optional(),
  duracao_minutos: z.number().int().positive().optional(),
  status: z.string().optional(),
  observacoes: z.string().max(2000).optional(),
});
export const updateTeleconsultaSchema = createTeleconsultaSchema.partial();

export const startSessionSchema = z.object({
  teleconsulta_id: z.string().uuid(),
});

export const endSessionSchema = z.object({
  teleconsulta_id: z.string().uuid(),
  duration_minutes: z.number().int().nonnegative(),
  notes: z.string().max(5000).optional(),
});

export const addNotesSchema = z.object({
  teleconsulta_id: z.string().uuid(),
  notes: z.string().max(5000),
  diagnosis: z.string().max(2000).optional(),
  recommendations: z.string().max(2000).optional(),
});

export const addPrescriptionSchema = z.object({
  teleconsulta_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  medications: z.array(z.object({
    name: z.string().max(200),
    dosage: z.string().max(200),
    frequency: z.string().max(200),
    duration: z.string().max(200),
    instructions: z.string().max(500).optional(),
  })).min(1).max(20),
  observations: z.string().max(2000).optional(),
});
