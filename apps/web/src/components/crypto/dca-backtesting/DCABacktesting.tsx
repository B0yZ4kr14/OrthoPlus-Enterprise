// cspell:disable
import { useDCABacktesting } from "./useDCABacktesting";
import { ConfigPanel } from "./ConfigPanel";
import { ResultsCard } from "./ResultsCard";
import { ResultsChart } from "./ResultsChart";
import { AnalysisPanel } from "./AnalysisPanel";

export function DCABacktesting() {
  const {
    coinType,
    setCoinType,
    monthlyAmount,
    setMonthlyAmount,
    period,
    setPeriod,
    results,
    loading,
    summary,
    runBacktest,
  } = useDCABacktesting();

  return (
    <div className="space-y-6">
      <ConfigPanel
        coinType={coinType}
        monthlyAmount={monthlyAmount}
        period={period}
        loading={loading}
        onCoinTypeChange={setCoinType}
        onMonthlyAmountChange={setMonthlyAmount}
        onPeriodChange={setPeriod}
        onRunBacktest={runBacktest}
      />

      {summary && (
        <>
          <ResultsCard summary={summary} coinType={coinType} />
          {results && <ResultsChart results={results} />}
          <AnalysisPanel summary={summary} />
        </>
      )}
    </div>
  );
}

export default DCABacktesting;
