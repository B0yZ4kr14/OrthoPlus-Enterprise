import { z } from 'zod';

export const createOrcamentoSchema = z.object({
  numero_orcamento: z.string().max(50),
  titulo: z.string().max(200),
  patient_id: z.string().uuid(),
  tipo_plano: z.string(),
  data_validade: z.string(),
  valor_total: z.number().int().nonnegative(),
  status: z.string().optional(),
  observacoes: z.string().max(2000).optional(),
  descricao: z.string().optional(),
  validade_dias: z.number().int().nonnegative().optional(),
});
export const updateOrcamentoSchema = createOrcamentoSchema.partial();

export const addItemSchema = z.object({
  procedimento_id: z.string().uuid().optional(),
  descricao: z.string().max(500),
  ordem: z.number().int().nonnegative(),
  quantidade: z.number().int().positive(),
  valor_unitario: z.number().int().nonnegative(),
  valor_total: z.number().int().nonnegative(),
  observacoes: z.string().max(500).optional(),
  dente_codigo: z.string().max(10).optional(),
});
