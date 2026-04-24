import type { CryptoPortfolioDashboardProps } from "./types";
import { usePortfolioData } from "./usePortfolioData";
import { usePortfolioExport } from "./usePortfolioExport";
import { PortfolioLoading } from "./PortfolioLoading";
import { PortfolioKPIs } from "../portfolio/PortfolioKPIs";
import { PortfolioDistributionChart } from "../portfolio/PortfolioDistributionChart";
import { ConversionsHistory } from "../portfolio/ConversionsHistory";
import { RealTimeRates } from "../portfolio/RealTimeRates";

export function CryptoPortfolioDashboard({
  wallets,
  transactions,
}: CryptoPortfolioDashboardProps) {
  const { portfolioData, loading, rates, refresh } = usePortfolioData(
    wallets,
    transactions,
  );
  const { exportToCSV, exportToPDF } = usePortfolioExport(portfolioData);

  if (loading || !portfolioData) {
    return <PortfolioLoading />;
  }

  return (
    <div className="space-y-6">
      <PortfolioKPIs
        totalBRL={portfolioData.totalBRL}
        gains={portfolioData.gains}
        losses={portfolioData.losses}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioDistributionChart
          distribution={portfolioData.distribution}
          totalCrypto={portfolioData.totalCrypto}
        />

        <ConversionsHistory
          conversions={portfolioData.conversionsHistory}
          onExportCSV={exportToCSV}
          onExportPDF={exportToPDF}
        />
      </div>

      <RealTimeRates rates={rates} onRefresh={refresh} />
    </div>
  );
}
