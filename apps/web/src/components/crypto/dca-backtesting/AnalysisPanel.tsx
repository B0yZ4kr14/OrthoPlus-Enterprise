// cspell:disable
import type { BacktestSummary } from "./types";

interface AnalysisPanelProps {
  summary: BacktestSummary;
}

export function AnalysisPanel({ summary }: AnalysisPanelProps) {
  const dcaBetter = summary.dcaReturn > summary.lumpSumReturn;
  const difference = dcaBetter
    ? summary.dcaReturn - summary.lumpSumReturn
    : summary.lumpSumReturn - summary.dcaReturn;

  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border">
      <h4 className="font-semibold mb-2">Análise Comparativa</h4>
      <p className="text-sm text-muted-foreground">
        {dcaBetter ? (
          <>
            <span className="font-semibold text-success">
              DCA foi {difference.toFixed(2)}% melhor
            </span>{" "}
            que investimento único neste período. O DCA reduz risco ao
            distribuir compras ao longo do tempo, evitando timing de mercado.
          </>
        ) : (
          <>
            <span className="font-semibold text-secondary">
              Investimento único foi {difference.toFixed(2)}% melhor
            </span>{" "}
            que DCA neste período. Em mercados em alta constante, lump sum
            tende a superar DCA por entrar com capital total no início.
          </>
        )}
      </p>
    </div>
  );
}
