// cspell:disable
import { Brain } from "lucide-react";

interface EmptyStateProps {
  hasAnalises: boolean;
}

export function EmptyState({ hasAnalises }: EmptyStateProps) {
  if (hasAnalises) return null;

  return (
    <div className="text-center py-12 text-muted-foreground">
      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Nenhuma análise disponível para gerar insights</p>
      <p className="text-sm mt-2">
        Realize algumas análises para visualizar padrões e recomendações
      </p>
    </div>
  );
}
