import type { LeadStatus } from "../types";

export const statusLabels: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATO_INICIAL: "Contato Inicial",
  QUALIFICADO: "Qualificado",
  PROPOSTA: "Proposta",
  NEGOCIACAO: "Negociação",
  GANHO: "Ganho",
  PERDIDO: "Perdido",
};

export const statusColors: Record<LeadStatus, string> = {
  NOVO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONTATO_INICIAL: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  QUALIFICADO: "bg-info/10 text-info border-info/20",
  PROPOSTA: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  NEGOCIACAO: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  GANHO: "bg-green-500/10 text-green-500 border-green-500/20",
  PERDIDO: "bg-red-500/10 text-red-500 border-red-500/20",
};
