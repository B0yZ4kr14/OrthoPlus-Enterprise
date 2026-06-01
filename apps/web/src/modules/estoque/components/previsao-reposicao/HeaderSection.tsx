// cspell:disable
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";

interface HeaderSectionProps {
  onGerarPrevisoes: () => void;
  loading: boolean;
  disabled: boolean;
}

export function HeaderSection({
  onGerarPrevisoes,
  loading,
  disabled,
}: HeaderSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold">
        Previsão Inteligente de Reposição (IA)
      </h3>
      <p className="text-sm text-muted-foreground">
        Análise preditiva usando machine learning baseada em padrões históricos
        de consumo
      </p>
      <Button type="button"
        onClick={onGerarPrevisoes}
        disabled={loading || disabled}
        className="mt-4"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analisando...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            Gerar Previsões IA
          </>
        )}
      </Button>
    </div>
  );
}
