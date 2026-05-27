import type { AtividadeStatus } from "../types";

export const statusLabels: Record<AtividadeStatus, string> = {
  AGENDADA: "Agendada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const statusColors: Record<AtividadeStatus, string> = {
  AGENDADA: "bg-info/10 text-info border-info/20",
  CONCLUIDA: "bg-success/10 text-success border-success/20",
  CANCELADA: "bg-destructive/10 text-destructive border-destructive/20",
};
