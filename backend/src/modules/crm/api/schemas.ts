import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().max(200),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  source: z.string().max(100).optional(),
  status: z.string().optional(),
  notes: z.string().max(2000).optional(),
  assigned_to: z.string().uuid().optional(),
  estimated_value: z.number().int().nonnegative().optional(),
  interest_description: z.string().optional(),
  next_contact_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
export const updateLeadSchema = createLeadSchema.partial();
