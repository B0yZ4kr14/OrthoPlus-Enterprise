import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().min(1, "Query is required"),
  filters: z
    .object({
      author: z.string().optional(),
      featureNumber: z.string().optional(),
    })
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const contextBriefSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  max_tokens: z.number().int().min(100).max(200000).default(80000),
  include_related: z.boolean().default(true),
});

export const graphSchema = z.object({
  sourcePath: z.string().min(1, "Source path is required"),
});

export const rotateKeySchema = z.object({
  provider: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  baseUrl: z.string().url().optional(),
});

export const costsSchema = z.object({
  month: z.string().optional(),
});

export const driftSchema = z.object({
  severity: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
