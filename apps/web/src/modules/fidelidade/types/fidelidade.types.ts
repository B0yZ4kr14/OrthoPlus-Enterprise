import { z } from "zod";

export const fidelidadeConfigSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  pontos_por_consulta: z.number().default(10),
  pontos_por_real: z.number().default(1),
  pontos_indicacao: z.number().default(50),
  ativo: z.boolean().default(true),
});

export const fidelidadePontosSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  pontos_disponiveis: z.number().default(0),
  pontos_totais: z.number().default(0),
  nivel: z
    .enum(["BRONZE", "PRATA", "OURO", "PLATINA", "DIAMANTE"])
    .default("BRONZE"),
});

export const fidelidadeTransacaoSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  tipo: z.enum([
    "GANHO_CONSULTA",
    "GANHO_PAGAMENTO",
    "GANHO_INDICACAO",
    "RESGATE",
    "EXPIRACAO",
  ]),
  pontos: z.number(),
  descricao: z.string(),
  referencia_id: z.string().uuid().optional(),
});

export const fidelidadeRecompensaSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  nome: z.string().min(1),
  descricao: z.string().min(1),
  pontos_necessarios: z.number().min(0),
  tipo: z.enum([
    "DESCONTO_PERCENTUAL",
    "DESCONTO_VALOR",
    "PROCEDIMENTO_GRATIS",
    "BRINDE",
  ]),
  valor_desconto: z.number().optional(),
  procedimento_id: z.string().uuid().optional(),
  ativo: z.boolean().default(true),
});

export const fidelidadeBadgeSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  nome: z.string().min(1),
  descricao: z.string().min(1),
  icone: z.string().min(1),
  criterio: z.record(z.unknown()),
  compartilhavel: z.boolean().default(true),
});

export const fidelidadeIndicacaoSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  indicador_id: z.string().uuid(),
  indicado_nome: z.string().min(1),
  indicado_telefone: z.string().min(1),
  indicado_email: z.string().email().optional(),
  status: z
    .enum(["PENDENTE", "AGENDADO", "COMPARECEU", "NAO_COMPARECEU"])
    .default("PENDENTE"),
  pontos_concedidos: z.number().optional(),
});

export type FidelidadeConfig = z.infer<typeof fidelidadeConfigSchema>;
export type FidelidadePontos = z.infer<typeof fidelidadePontosSchema>;
export type FidelidadeTransacao = z.infer<typeof fidelidadeTransacaoSchema>;
export type FidelidadeRecompensa = z.infer<typeof fidelidadeRecompensaSchema>;
export type FidelidadeBadge = z.infer<typeof fidelidadeBadgeSchema>;
export type FidelidadeIndicacao = z.infer<typeof fidelidadeIndicacaoSchema>;

export interface FidelidadePontosComplete extends FidelidadePontos {
  patient_name?: string;
  badges?: FidelidadeBadge[];
  historico?: FidelidadeTransacao[];
}

export const nivelFidelidadeLabels: Record<string, string> = {
  BRONZE: "Bronze",
  PRATA: "Prata",
  OURO: "Ouro",
  PLATINA: "Platina",
  DIAMANTE: "Diamante",
};
