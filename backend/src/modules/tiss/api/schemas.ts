import { z } from 'zod';

export const createGuiaSchema = z.object({
  guide_number: z.string().max(50),
  insurance_company: z.string().max(200),
  amount: z.number().int().nonnegative(),
  service_date: z.string(),
  patient_id: z.string().uuid(),
  procedure_code: z.string().max(50),
  procedure_name: z.string().max(200),
  status: z.string().optional(),
  batch_id: z.string().uuid().optional(),
  submission_date: z.string().optional(),
});
export const updateGuiaSchema = createGuiaSchema.partial();

export const createLoteSchema = z.object({
  batch_number: z.string().max(50),
  insurance_company: z.string().max(200),
  total_guides: z.number().int().nonnegative(),
  total_amount: z.number().int().nonnegative(),
  status: z.string().optional(),
  sent_at: z.string().optional(),
});
export const updateLoteSchema = createLoteSchema.partial();

export const submitBatchSchema = z.object({
  guide_ids: z.array(z.string().uuid()).min(1).max(500),
  insurance_company: z.string().max(200),
  batch_number: z.string().max(50).optional(),
});
