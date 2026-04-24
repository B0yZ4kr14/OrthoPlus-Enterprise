// cspell:disable
import { memo } from "react";
import { Card } from "@orthoplus/core-ui/card";
import { Brain } from "lucide-react";
import type { AnaliseComplete } from "../../types/radiografia.types";
import { useIAInsights } from "./useIAInsights";
import { KPICards } from "./KPICards";
import { EmptyState } from "./EmptyState";
import { PadroesCard } from "./PadroesCard";
import { AreasCard } from "./AreasCard";
import { SeveridadesCard } from "./SeveridadesCard";
import { TiposCard } from "./TiposCard";
import { RecomendacoesCard } from "./RecomendacoesCard";

interface IAInsightsDashboardProps {
  analises: AnaliseComplete[];
}

export const IAInsightsDashboard = memo(function IAInsightsDashboard({
  analises,
}: IAInsightsDashboardProps) {
  const {
    padroesMaisComuns,
    areasProblematicas,
    severidades,
    tiposMaisAnalisados,
    taxaMediaProblemas,
    precisaoMediaGeral,
    recomendacoesPreventivas,
  } = useIAInsights(analises);

  const hasAnalises = analises.length > 0;

  return (
    <div className="space-y-6">
      <Card className="p-6" depth="intense">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Dashboard de Insights da IA</h2>
        </div>

        <EmptyState hasAnalises={hasAnalises} />

        {hasAnalises && (
          <div className="space-y-6">
            <KPICards
              totalAnalises={analises.length}
              taxaMediaProblemas={taxaMediaProblemas}
              precisaoMediaGeral={precisaoMediaGeral}
              padroesCount={padroesMaisComuns.length}
            />

            <PadroesCard padroes={padroesMaisComuns} />
            <AreasCard areas={areasProblematicas} />
            <SeveridadesCard severidades={severidades} />
            <TiposCard tipos={tiposMaisAnalisados} />
            <RecomendacoesCard recomendacoes={recomendacoesPreventivas} />
          </div>
        )}
      </Card>
    </div>
  );
});
