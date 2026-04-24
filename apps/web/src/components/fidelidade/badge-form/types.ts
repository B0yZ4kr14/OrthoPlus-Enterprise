import { z } from "zod";

export const badgeSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  icone: z.string().min(1, "Selecione um ícone"),
  criterio_tipo: z.enum(["pontos_totais", "nivel"]),
  criterio_valor: z.union([z.number(), z.string()]),
  compartilhavel: z.boolean(),
});

export type BadgeFormData = z.infer<typeof badgeSchema>;

export interface BadgeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type CriterioTipo = "pontos_totais" | "nivel";

export const ICONE_OPTIONS = [
  { value: "🎯", label: "🎯 Alvo" },
  { value: "⭐", label: "⭐ Estrela" },
  { value: "🏆", label: "🏆 Troféu" },
  { value: "🥇", label: "🥇 Ouro" },
  { value: "🥈", label: "🥈 Prata" },
  { value: "🥉", label: "🥉 Bronze" },
  { value: "💎", label: "💎 Diamante" },
  { value: "💠", label: "💠 Joia" },
  { value: "🎖️", label: "🎖️ Medalha" },
  { value: "👑", label: "👑 Coroa" },
] as const;

export const NIVEL_OPTIONS = [
  { value: "BRONZE", label: "Bronze" },
  { value: "PRATA", label: "Prata" },
  { value: "OURO", label: "Ouro" },
  { value: "PLATINA", label: "Platina" },
  { value: "DIAMANTE", label: "Diamante" },
] as const;
