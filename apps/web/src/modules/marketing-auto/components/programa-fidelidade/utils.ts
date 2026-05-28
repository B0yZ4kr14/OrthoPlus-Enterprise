// cspell:disable
import type { NivelFidelidade, StatusIndicacao } from "./types";

export function getNivelColor(nivel: NivelFidelidade): string {
  switch (nivel) {
    case "DIAMANTE":
      return "text-info";
    case "PLATINA":
      return "text-muted-foreground";
    case "OURO":
      return "text-warning";
    case "PRATA":
      return "text-muted-foreground";
    case "BRONZE":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
}

export function getStatusIndicacaoVariant(status: StatusIndicacao): "default" | "info" | "warning" | "destructive" | "secondary" {
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
