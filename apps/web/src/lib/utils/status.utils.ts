import { BadgeProps } from "@orthoplus/core-ui/badge";

// Mapeamento centralizado de cores de status
export const statusColorMap: Record<string, BadgeProps["variant"]> = {
  // Dentista / Paciente statuses (capitalized)
  Ativo: "default",
  Inativo: "secondary",
  Pendente: "outline",
  Férias: "outline",
  Afastado: "destructive",
  Agendada: "outline",
  Confirmada: "default",
  Realizada: "secondary",
  Cancelada: "destructive",
  Faltou: "outline",
  // LGPD request statuses (lowercase)
  pendente: "destructive",
  em_analise: "secondary",
  concluida: "default",
  // TISS batch statuses (lowercase)
  enviado: "default",
  processando: "secondary",
  // CRM Lead statuses
  NOVO: "default",
  CONTATO_INICIAL: "secondary",
  QUALIFICADO: "outline",
  PROPOSTA: "default",
  NEGOCIACAO: "secondary",
  GANHO: "default",
  PERDIDO: "destructive",
  // Inadimplência statuses
  novo: "secondary",
  em_negociacao: "default",
  critico: "destructive",
};

export function getStatusColor(status: string): BadgeProps["variant"] {
  return statusColorMap[status] || "default";
}

// Mapeamento de cores CSS para status (usado com className)
export const statusTextColorMap: Record<string, string> = {
  // Patient statuses (lowercase)
  ativo: "bg-success/10 text-success",
  inativo: "bg-warning/10 text-warning",
  arquivado: "bg-muted text-muted-foreground",
  // System monitoring statuses
  healthy: "text-green-500",
  warning: "text-yellow-500",
  critical: "text-red-500",
};

export function getStatusTextColor(status: string): string {
  return statusTextColorMap[status] || "bg-secondary";
}

// Labels de status para exibição
export const statusLabels: Record<string, string> = {
  Ativo: "Ativo",
  Inativo: "Inativo",
  Pendente: "Pendente",
  Férias: "Férias",
  Afastado: "Afastado",
  Agendada: "Agendada",
  Confirmada: "Confirmada",
  Realizada: "Realizada",
  Cancelada: "Cancelada",
  Faltou: "Paciente Faltou",
};

export function getStatusLabel(status: string): string {
  return statusLabels[status] || status;
}
