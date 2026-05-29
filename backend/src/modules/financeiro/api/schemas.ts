import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.string().max(50),
  status: z.string().max(50).optional(),
  amount: z.number().nonnegative(),
  description: z.string().max(1000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  paid_date: z.string().optional().nullable(),
  related_entity_type: z.string().max(100).optional().nullable(),
  related_entity_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  payment_method: z.string().max(100).optional().nullable(),
});

export const updateTransactionSchema = z.object({
  type: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
  amount: z.number().nonnegative().optional(),
  description: z.string().max(1000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  paid_date: z.string().optional().nullable(),
  related_entity_type: z.string().max(100).optional().nullable(),
  related_entity_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  payment_method: z.string().max(100).optional().nullable(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  description: z.string().max(1000).optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  description: z.string().max(1000).optional().nullable(),
});

export const createCashRegisterSchema = z.object({
  status: z.string().max(50).optional(),
  opened_at: z.string().optional().nullable(),
  closed_at: z.string().optional().nullable(),
  saldo_inicial: z.number().optional(),
  saldo_final: z.number().optional().nullable(),
  opened_by: z.string().max(200).optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
});

export const updateCashRegisterSchema = z.object({
  status: z.string().max(50).optional(),
  closed_at: z.string().optional().nullable(),
  saldo_final: z.number().optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
});

export const createMovimentoSchema = z.object({
  cash_register_id: z.string().uuid().optional().nullable(),
  tipo: z.string().max(50),
  valor: z.number(),
  descricao: z.string().max(1000).optional().nullable(),
  status: z.string().max(50).optional(),
  payment_method: z.string().max(100).optional().nullable(),
  reference_id: z.string().uuid().optional().nullable(),
  reference_type: z.string().max(100).optional().nullable(),
});

export const updateMovimentoSchema = z.object({
  tipo: z.string().max(50).optional(),
  valor: z.number().optional(),
  descricao: z.string().max(1000).optional().nullable(),
  status: z.string().max(50).optional(),
  payment_method: z.string().max(100).optional().nullable(),
});

export const createIncidenteSchema = z.object({
  cash_register_id: z.string().uuid().optional().nullable(),
  tipo_incidente: z.string().max(100),
  descricao: z.string().max(2000).optional().nullable(),
  valor_perdido: z.number().nonnegative().optional().nullable(),
  data_incidente: z.string().optional().nullable(),
  acoes_tomadas: z.string().max(2000).optional().nullable(),
});

export const updateIncidenteSchema = z.object({
  tipo_incidente: z.string().max(100).optional(),
  descricao: z.string().max(2000).optional().nullable(),
  valor_perdido: z.number().nonnegative().optional().nullable(),
  data_incidente: z.string().optional().nullable(),
  acoes_tomadas: z.string().max(2000).optional().nullable(),
});

export const createContaReceberSchema = z.object({
  patient_id: z.string().uuid().optional().nullable(),
  descricao: z.string().max(1000).optional().nullable(),
  valor: z.number().nonnegative(),
  data_vencimento: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  metodo_pagamento: z.string().max(100).optional().nullable(),
  parcelas: z.number().int().positive().optional(),
  observacoes: z.string().max(2000).optional().nullable(),
});

export const updateContaReceberSchema = z.object({
  descricao: z.string().max(1000).optional().nullable(),
  valor: z.number().nonnegative().optional(),
  data_vencimento: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  data_pagamento: z.string().optional().nullable(),
  metodo_pagamento: z.string().max(100).optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
});

export const createContaPagarSchema = z.object({
  fornecedor: z.string().max(200).optional().nullable(),
  descricao: z.string().max(1000).optional().nullable(),
  valor: z.number().nonnegative(),
  data_vencimento: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  category_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
});

export const updateContaPagarSchema = z.object({
  fornecedor: z.string().max(200).optional().nullable(),
  descricao: z.string().max(1000).optional().nullable(),
  valor: z.number().nonnegative().optional(),
  data_vencimento: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  data_pagamento: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
});

export const createNotaFiscalSchema = z.object({
  patient_id: z.string().uuid().optional().nullable(),
  numero_nota: z.string().max(100).optional().nullable(),
  serie: z.string().max(50).optional().nullable(),
  valor_total: z.number().nonnegative(),
  status: z.string().max(50).optional(),
  data_emissao: z.string().optional().nullable(),
  chave_acesso: z.string().max(500).optional().nullable(),
  descricao: z.string().max(2000).optional().nullable(),
});

export const updateNotaFiscalSchema = z.object({
  numero_nota: z.string().max(100).optional().nullable(),
  serie: z.string().max(50).optional().nullable(),
  valor_total: z.number().nonnegative().optional(),
  status: z.string().max(50).optional(),
  data_emissao: z.string().optional().nullable(),
  chave_acesso: z.string().max(500).optional().nullable(),
  descricao: z.string().max(2000).optional().nullable(),
});

export const updateExtratoSchema = z.object({
  conciliado: z.boolean().optional(),
  transaction_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
});
