import { z } from "zod";

export const leadSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  origem: z.string().min(1, "Origem é obrigatória"),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  interesse: z.string().optional(),
  status_funil: z.enum([
    "NOVO",
    "CONTATO_INICIAL",
    "QUALIFICADO",
    "PROPOSTA_ENVIADA",
    "NEGOCIACAO",
    "CONVERTIDO",
    "PERDIDO",
  ]),
  temperatura: z.enum(["FRIO", "MORNO", "QUENTE"]),
  valor_estimado: z.number().optional(),
  observacoes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

export interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  onCancel: () => void;
  initialData?: Partial<LeadFormData>;
}

export type StatusFunil = LeadFormData["status_funil"];
export type Temperatura = LeadFormData["temperatura"];

export const ORIGEM_OPTIONS = [
  { value: "SITE", label: "Site" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "GOOGLE_ADS", label: "Google Ads" },
  { value: "INDICACAO", label: "Indicação" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "TELEFONE", label: "Telefone" },
  { value: "OUTROS", label: "Outros" },
] as const;

export const STATUS_FUNIL_OPTIONS = [
  { value: "NOVO", label: "Novo Lead" },
  { value: "CONTATO_INICIAL", label: "Contato Inicial" },
  { value: "QUALIFICADO", label: "Qualificado" },
  { value: "PROPOSTA_ENVIADA", label: "Proposta Enviada" },
  { value: "NEGOCIACAO", label: "Em Negociação" },
  { value: "CONVERTIDO", label: "Convertido" },
  { value: "PERDIDO", label: "Perdido" },
] as const;

export const TEMPERATURA_OPTIONS = [
  { value: "FRIO", label: "🥶 Frio" },
  { value: "MORNO", label: "😐 Morno" },
  { value: "QUENTE", label: "🔥 Quente" },
] as const;
