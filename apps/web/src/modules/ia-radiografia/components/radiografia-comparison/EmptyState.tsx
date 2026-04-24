// cspell:disable
import { GitCompare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Nenhum paciente com múltiplas análises disponível</p>
      <p className="text-sm mt-2">
        É necessário pelo menos 2 análises do mesmo paciente
      </p>
    </div>
  );
}
