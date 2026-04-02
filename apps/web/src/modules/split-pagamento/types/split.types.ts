import { z } from "zod";

// Split de Pagamento Types
export const splitConfigSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  dentist_id: z.string().uuid(),
  percentual_split: z.number().min(0).max(100),
  procedimento_id: z.string().uuid().optional(),
  ativo: z.boolean().default(true),
  chave_pix: z.string().optional(),
});

export const splitTransacaoSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  transacao_origem_id: z.string().uuid(),
  dentist_id: z.string().uuid(),
  valor_original: z.number(),
  percentual_split: z.number(),
  valor_split: z.number(),
  status: z.enum(["PENDENTE", "PROCESSANDO", "CONCLUIDO", "FALHA"]),
  chave_pix_destino: z.string().optional(),
  comprovante_pix: z.string().optional(),
  nota_fiscal_url: z.string().optional(),
  processado_em: z.string().optional(),
  erro_mensagem: z.string().optional(),
});

export const splitComissaoSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  dentist_id: z.string().uuid(),
  mes_referencia: z.string(),
  total_vendas: z.number().default(0),
  total_comissao: z.number().default(0),
  total_pago: z.number().default(0),
  total_pendente: z.number().default(0),
});

export type SplitConfig = z.infer<typeof splitConfigSchema>;
export type SplitTransacao = z.infer<typeof splitTransacaoSchema>;
export type SplitComissao = z.infer<typeof splitComissaoSchema>;

export interface SplitComissaoComplete extends SplitComissao {
  dentist_name?: string;
  transacoes?: SplitTransacao[];
}

export const statusSplitLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  PROCESSANDO: "Processando",
  CONCLUIDO: "Concluído",
  FALHA: "Falha",
};
