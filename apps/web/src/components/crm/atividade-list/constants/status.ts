import type { AtividadeStatus } from "../types";

export const statusLabels: Record<AtividadeStatus, string> = {
  AGENDADA: "Agendada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const statusColors: Record<AtividadeStatus, string> = {
  AGENDADA: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONCLUIDA: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELADA: "bg-red-500/10 text-red-500 border-red-500/20",
};
