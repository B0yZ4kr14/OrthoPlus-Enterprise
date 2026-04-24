// cspell:disable
import {
  Card,
  CardContent,
} from "@orthoplus/core-ui/card";
import { useCryptoAnalysis } from "./useCryptoAnalysis";
import { KpiCards } from "./KpiCards";
import { AnalysisTabs } from "./AnalysisTabs";
import { CandlestickChart } from "../CandlestickChart";

interface CryptoAnalysisDashboardProps {
  clinicId: string;
}

export function CryptoAnalysisDashboard({
  clinicId,
}: CryptoAnalysisDashboardProps) {
  const {
    loading,
    exchangeRates,
    candlestickData,
    stats,
    rateHistoryData,
    volumeData,
    savingsComparisonData,
  } = useCryptoAnalysis({ clinicId });

  if (loading) {
    return (
      <Card depth="normal">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando análise...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <KpiCards stats={stats} />

      {candlestickData.length > 0 && (
        <CandlestickChart data={candlestickData} coinType="BTC" />
      )}

      <AnalysisTabs
        exchangeRates={exchangeRates}
        stats={stats}
        rateHistoryData={rateHistoryData}
        volumeData={volumeData}
        savingsComparisonData={savingsComparisonData}
      />
    </div>
  );
}

export default CryptoAnalysisDashboard;
