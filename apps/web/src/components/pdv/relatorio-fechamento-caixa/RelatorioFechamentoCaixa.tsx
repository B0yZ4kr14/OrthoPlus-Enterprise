// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { useRelatorioFechamento } from "./useRelatorioFechamento";
import { ReportHeader } from "./ReportHeader";
import { KPICards } from "./KPICards";
import { ComparisonChart } from "./ComparisonChart";
import { AlertSection } from "./AlertSection";
import { LoadingState } from "@/components/shared/LoadingState";
import type { RelatorioFechamentoCaixaProps } from "./types";

export function RelatorioFechamentoCaixa({
  caixaMovimentoId,
}: RelatorioFechamentoCaixaProps) {
  const { fechamento, isLoading, gerandoSped, gerarSpedMutation } =
    useRelatorioFechamento({
      caixaMovimentoId,
    });

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <ReportHeader
          gerandoSped={gerandoSped}
          onGerarSped={() => gerarSpedMutation.mutate()}
        />
        <KPICards fechamento={fechamento} />
        <ComparisonChart fechamento={fechamento} />
        <AlertSection fechamento={fechamento} />
      </Card>
    </div>
  );
}
