// cspell:disable
import { useConversionSimulator } from "./useConversionSimulator";
import { SimulationConfig } from "./SimulationConfig";
import { RecommendationAlert } from "./RecommendationAlert";
import { HistoryChart } from "./HistoryChart";
import { ExchangeComparison } from "./ExchangeComparison";

export function ConversionSimulator() {
  const {
    coinType,
    setCoinType,
    amount,
    setAmount,
    historicalData,
    exchangeRates,
    bestMoment,
    refreshSimulation,
  } = useConversionSimulator();

  return (
    <div className="space-y-6">
      <SimulationConfig
        coinType={coinType}
        amount={amount}
        onCoinTypeChange={setCoinType}
        onAmountChange={setAmount}
        onRefresh={refreshSimulation}
      />

      <RecommendationAlert bestMoment={bestMoment} />
      <HistoryChart data={historicalData} bestMoment={bestMoment} />
      <ExchangeComparison rates={exchangeRates} amount={amount} />
    </div>
  );
}

export default ConversionSimulator;
