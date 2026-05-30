import { z } from "zod";

export const createProntuarioSchema = z.object({
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

export const odontogramaCreateSchema = z.object({
  patient_id: z.string().uuid(),
  odontograma_data: z.record(z.unknown()),
  observacoes: z.string().max(2000).optional().nullable(),
});

export const odontogramaHistoryCreateSchema = z.object({
  patient_id: z.string().uuid(),
  odontograma_data: z.record(z.unknown()),
  observacoes: z.string().max(2000).optional().nullable(),
});

export const odontogramaUpdateSchema = z.object({
  odontograma_data: z.record(z.unknown()).optional(),
  observacoes: z.string().max(2000).optional().nullable(),
});
