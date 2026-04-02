import { z } from 'zod';

export const createADRSchema = z.object({
  title: z.string().max(200),
  decision: z.string(),
  consequences: z.string(),
  context: z.string(),
  status: z.string(),
  adr_number: z.number().int().positive(),
  alternatives_considered: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createWikiPageSchema = z.object({
  title: z.string().max(200),
  content: z.string(),
  slug: z.string().max(200),
  category: z.string(),
  version: z.number().int().positive().optional(),
  is_published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  parent_id: z.string().uuid().optional(),
});
export const updateWikiPageSchema = createWikiPageSchema.partial();
