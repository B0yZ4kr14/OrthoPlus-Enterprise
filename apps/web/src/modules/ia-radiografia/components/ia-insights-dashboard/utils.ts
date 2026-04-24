// cspell:disable

export function getPrioridadeColor(prioridade: string): string {
  const colors: Record<string, string> = {
    alta: "destructive",
    media: "warning",
    baixa: "success",
  };
  return colors[prioridade] || "default";
}

export function getSeveridadeColor(severidade: string): string {
  const colors: Record<string, string> = {
    ALTA: "destructive",
    MEDIA: "warning",
    BAIXA: "success",
  };
  return colors[severidade] || "default";
}
