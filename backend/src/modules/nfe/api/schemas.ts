import { z } from "zod";

export const createNfeSchema = z.object({
  numero: z.string().max(50),
  serie: z.string().max(10),
  tipo: z.enum(["NFE", "NFCE", "NFSE"]),
  cliente_id: z.string().uuid(),
  cliente_nome: z.string().max(200),
  valor_total: z.number().nonnegative(),
  data_emissao: z.string(),
});

export const updateNfeSchema = z.object({
  status: z.enum(["RASCUNHO", "AUTORIZADA", "CANCELADA", "REJEITADA", "INUTILIZADA"]).optional(),
  chave_acesso: z.string().max(100).nullable().optional(),
  xml: z.string().nullable().optional(),
  pdf_url: z.string().url().nullable().optional(),
  protocolo: z.string().max(100).nullable().optional(),
});
