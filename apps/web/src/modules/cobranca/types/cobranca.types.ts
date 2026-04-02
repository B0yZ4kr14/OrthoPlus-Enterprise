import { z } from "zod";

export const cobrancaSchema = z.object({
  id: z.string().optional(),
  paciente_id: z.string().min(1, "Paciente é obrigatório"),
  paciente_nome: z.string().min(1, "Nome do paciente é obrigatório"),
  transacao_financeira_id: z.string().optional().nullable(),
  valor_original: z.number().positive("Valor deve ser positivo"),
  valor_pendente: z.number().positive("Valor deve ser positivo"),
  data_vencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  status: z.enum(["PENDENTE", "EM_COBRANCA", "PAGO", "CANCELADO", "ACORDO"]),
  descricao: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export const cobrancaConfigSchema = z.object({
  id: z.string().optional(),
  dias_primeira_cobranca: z.number().int().min(1).max(30),
  dias_segunda_cobranca: z.number().int().min(1).max(60),
  dias_terceira_cobranca: z.number().int().min(1).max(90),
  mensagem_email_template: z.string().optional().nullable(),
  mensagem_whatsapp_template: z.string().optional().nullable(),
  auto_cobranca_enabled: z.boolean(),
});

export type Cobranca = z.infer<typeof cobrancaSchema> & {
  dias_atraso?: number;
  tentativas_contato?: number;
  ultima_tentativa_contato?: string;
  proximo_contato_agendado?: string;
  clinic_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
};

export type CobrancaConfig = z.infer<typeof cobrancaConfigSchema> & {
  clinic_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CobrancaTentativa = {
  id: string;
  cobranca_id: string;
  tipo_contato: "EMAIL" | "WHATSAPP" | "TELEFONE" | "SMS";
  status: "ENVIADO" | "FALHA" | "VISUALIZADO" | "RESPONDIDO";
  mensagem_enviada?: string;
  resposta?: string;
  erro?: string;
  created_at: string;
  created_by?: string;
};
