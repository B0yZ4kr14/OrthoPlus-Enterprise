import { z } from 'zod';

export const upsertConfigSchema = z.object({
  professional_id: z.string().uuid(),
  percentage: z.number().int().min(0).max(100),
  procedure_type: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const createComissaoSchema = z.object({
  professional_id: z.string().uuid(),
  amount: z.number().int().nonnegative(),
  percentage: z.number().int().min(0).max(100).optional(),
  transaction_id: z.string().uuid().optional(),
  config_id: z.string().uuid().optional(),
  status: z.string().optional(),
});

export const calculateSplitSchema = z.object({
  transaction_id: z.string().uuid(),
  total_amount: z.number().int().positive(),
  professional_id: z.string().uuid(),
  procedure_type: z.string().optional(),
});
