// cspell:disable
import { Brain, Target } from "lucide-react";
import type { Previsao } from "./types";

interface ComparativoCardProps {
  previsao: Previsao;
}

export function ComparativoCard({ previsao }: ComparativoCardProps) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <h4 className="font-semibold mb-3">{previsao.produto}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/10 p-3 rounded">
          <Brain className="w-5 h-5 mb-2" />
          <p className="font-bold">
            IA: {previsao.diasAteEstoqueZero} dias | {previsao.quantidadeSugerida} un
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Considera sazonalidade, tendências e eventos futuros
          </p>
        </div>
        <div className="bg-muted p-3 rounded">
          <Target className="w-5 h-5 mb-2" />
          <p className="font-bold">
            Tradicional:{" "}
            {previsao.metodoTradicional?.diasAteEstoqueZero || "N/A"} dias |{" "}
            {previsao.metodoTradicional?.quantidadeSugerida || "N/A"} un
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Apenas média simples dos últimos 30 dias
          </p>
        </div>
      </div>
    </div>
  );
}
