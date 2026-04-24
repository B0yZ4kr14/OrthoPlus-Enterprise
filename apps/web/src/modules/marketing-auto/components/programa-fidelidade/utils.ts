// cspell:disable
import type { NivelFidelidade, StatusIndicacao } from "./types";

export function getNivelColor(nivel: NivelFidelidade): string {
  switch (nivel) {
    case "DIAMANTE":
      return "text-cyan-500";
    case "PLATINA":
      return "text-slate-400";
    case "OURO":
      return "text-yellow-500";
    case "PRATA":
      return "text-gray-400";
    case "BRONZE":
      return "text-amber-700";
    default:
      return "text-muted-foreground";
  }
}

export function getStatusIndicacaoVariant(status: StatusIndicacao): string {
  switch (status) {
    case "COMPARECEU":
      return "default";
    case "AGENDADO":
      return "info";
    case "PENDENTE":
      return "warning";
    case "NAO_COMPARECEU":
      return "destructive";
    default:
      return "secondary";
  }
}
