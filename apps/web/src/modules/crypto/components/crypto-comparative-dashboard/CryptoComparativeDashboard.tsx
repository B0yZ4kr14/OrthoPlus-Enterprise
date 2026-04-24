// cspell:disable
import { useCryptoComparative } from "./useCryptoComparative";
import { EmptyState } from "./EmptyState";
import { KPICards } from "./KPICards";
import { SavingsAlert } from "./SavingsAlert";
import { FeeComparisonChart } from "./FeeComparisonChart";
import { FeeDistributionChart } from "./FeeDistributionChart";
import { SavingsChart } from "./SavingsChart";
import { ComparisonTable } from "./ComparisonTable";
import type { CryptoTransaction } from "./types";

interface CryptoComparativeDashboardProps {
  transactions: CryptoTransaction[];
}

function CryptoComparativeDashboard({
  transactions,
}: CryptoComparativeDashboardProps) {
  const {
    cryptoStats,
    cryptoFeePercentage,
    comparisonData,
    savingsData,
    pieData,
    totalSavings,
    avgSavingsPercentage,
    hasTransactions,
  } = useCryptoComparative({ transactions });

  if (!hasTransactions) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <KPICards
        cryptoStats={cryptoStats}
        cryptoFeePercentage={cryptoFeePercentage}
        totalSavings={totalSavings}
        avgSavingsPercentage={avgSavingsPercentage}
      />

      <SavingsAlert totalSavings={totalSavings} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeeComparisonChart data={comparisonData} />
        <FeeDistributionChart data={pieData} />
      </div>

      <SavingsChart data={savingsData} />
      <ComparisonTable data={comparisonData} cryptoStats={cryptoStats} />
    </div>
  );
}

export { CryptoComparativeDashboard };
export default CryptoComparativeDashboard;
