// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { BarChart3 } from "lucide-react";
import { useInventarioDashboard } from "./useInventarioDashboard";
import { Filters } from "./Filters";
import { KpiCards } from "./KpiCards";
import { ChartsSection } from "./ChartsSection";
import { RankingList } from "./RankingList";

export function EstoqueInventarioDashboard() {
  const {
    loading,
    selectedPeriod,
    setSelectedPeriod,
    kpis,
    tendenciaAcuracidade,
    perdasMensais,
    rankingProdutos,
    distribuicaoCriticidade,
  } = useInventarioDashboard();

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Dashboard Executivo - Inventário"
          description="Análise consolidada e KPIs em tempo real"
          icon={BarChart3}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Dashboard Executivo - Inventário"
        description="Análise consolidada e KPIs em tempo real"
        icon={BarChart3}
      />

      <Filters
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <KpiCards kpis={kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartsSection
          tendenciaAcuracidade={tendenciaAcuracidade}
          perdasMensais={perdasMensais}
          distribuicaoCriticidade={distribuicaoCriticidade}
        />
        <RankingList produtos={rankingProdutos} />
      </div>
    </div>
  );
}

export default EstoqueInventarioDashboard;
