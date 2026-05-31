import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { RefreshCw } from "lucide-react";
import { generateCryptoPerformanceReport } from "./CryptoPerformanceReport";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import type {
  CryptoWallet,
  CryptoTransaction,
} from "@/modules/crypto/types/crypto.types";
import type { PortfolioData } from "./portfolio/types";
import { formatBRL } from "./portfolio/types";
import { PortfolioKPIs } from "./portfolio/PortfolioKPIs";
import { PortfolioDistributionChart } from "./portfolio/PortfolioDistributionChart";
import { ConversionsHistory } from "./portfolio/ConversionsHistory";
import { RealTimeRates } from "./portfolio/RealTimeRates";
import { getCoinColor } from "./portfolio/types";

interface CryptoPortfolioDashboardProps {
  wallets: CryptoWallet[];
  transactions: CryptoTransaction[];
}

const DEFAULT_RATES: Record<string, number> = {
  BTC: 350000,
  ETH: 18000,
  USDT: 5.5,
  BNB: 1500,
  USDC: 5.5,
};

export function CryptoPortfolioDashboard({
  wallets,
  transactions,
}: CryptoPortfolioDashboardProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<Record<string, number>>({});

  const fetchRealRates = useCallback(async (): Promise<
    Record<string, number>
  > => {
    try {
      const { getSimplePrice } = await import("@/lib/api/cryptoMarketApi");
      const data = await getSimplePrice(
        ["bitcoin", "ethereum", "tether", "binancecoin", "usd-coin"],
        ["brl"],
      );

      return {
        BTC: data.bitcoin?.brl || DEFAULT_RATES.BTC,
        ETH: data.ethereum?.brl || DEFAULT_RATES.ETH,
        USDT: data.tether?.brl || DEFAULT_RATES.USDT,
        BNB: data.binancecoin?.brl || DEFAULT_RATES.BNB,
        USDC: data["usd-coin"]?.brl || DEFAULT_RATES.USDC,
      };
    } catch (error) {
      logger.error("Erro ao buscar cotações", error);
      return { ...DEFAULT_RATES };
    }
  }, []);

  const calculatePortfolio = useCallback(async () => {
    setLoading(true);

    try {
      const realRates = await fetchRealRates();
      setRates(realRates);

      const totalCrypto: Record<string, number> = {};
      wallets.forEach((wallet) => {
        if (wallet.is_active) {
          totalCrypto[wallet.coin_type] =
            (totalCrypto[wallet.coin_type] || 0) + wallet.balance;
        }
      });

      let totalBRL = 0;
      const distribution = Object.entries(totalCrypto).map(([coin, amount]) => {
        const rate = realRates[coin] || 0;
        const valueBRL = amount * rate;
        totalBRL += valueBRL;

        return {
          coin,
          value: valueBRL,
          percentage: 0,
          color: getCoinColor(coin),
        };
      });

      distribution.forEach((item) => {
        item.percentage = totalBRL > 0 ? (item.value / totalBRL) * 100 : 0;
      });

      let gains = 0;
      let losses = 0;
      const conversionsHistory = transactions
        .filter((tx) => tx.status === "CONVERTIDO")
        .map((tx) => {
          const amountBRL = tx.amount_brl || 0;
          const netAmountBRL = tx.net_amount_brl || 0;
          const isGain = netAmountBRL > amountBRL;
          const diff = netAmountBRL - amountBRL;

          if (isGain) gains += diff;
          else losses += Math.abs(diff);

          return {
            id: tx.id || "",
            date: new Date(tx.created_at || new Date()),
            fromCoin: tx.coin_type,
            toCoin: "BRL",
            amount: tx.amount_crypto,
            rate: tx.exchange_rate,
            valueBRL: netAmountBRL,
            type: (isGain ? "gain" : "loss") as "gain" | "loss",
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10);

      setPortfolioData({
        totalBRL,
        totalCrypto,
        distribution,
        gains,
        losses,
        conversionsHistory,
      });
    } catch (error) {
      logger.error("Erro ao calcular portfolio", error);
    } finally {
      setLoading(false);
    }
  }, [wallets, transactions, fetchRealRates]);

  useEffect(() => {
    calculatePortfolio();
  }, [calculatePortfolio]);

  const exportPortfolio = () => {
    if (!portfolioData) return;

    const csvContent = [
      ["Portfólio de Criptomoedas"],
      ["Data:", new Date().toLocaleDateString("pt-BR")],
      [""],
      ["Resumo"],
      ["Valor Total (BRL):", formatBRL(portfolioData.totalBRL)],
      ["Ganhos:", formatBRL(portfolioData.gains)],
      ["Perdas:", formatBRL(portfolioData.losses)],
      [""],
      ["Distribuição por Moeda"],
      ["Moeda", "Valor (BRL)", "Percentual"],
      ...portfolioData.distribution.map((item) => [
        item.coin,
        formatBRL(item.value),
        `${item.percentage.toFixed(2)}%`,
      ]),
      [""],
      ["Histórico de Conversões"],
      ["Data", "De", "Para", "Quantidade", "Taxa", "Valor BRL", "Tipo"],
      ...portfolioData.conversionsHistory.map((conv) => [
        format(conv.date, "dd/MM/yyyy HH:mm", { locale: ptBR }),
        conv.fromCoin,
        conv.toCoin,
        conv.amount.toFixed(8),
        conv.rate.toFixed(2),
        formatBRL(conv.valueBRL),
        conv.type === "gain" ? "Ganho" : "Perda",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio-crypto-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleGeneratePDFReport = async () => {
    if (!portfolioData) return;

    toast.loading("Gerando relatório PDF...");

    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await generateCryptoPerformanceReport(
        portfolioData,
        "Clínica",
        startDate,
        endDate,
      );

      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      logger.error("Erro ao gerar relatório", error);
      toast.error("Erro ao gerar relatório PDF");
    }
  };

  if (loading || !portfolioData) {
    return (
      <Card depth="normal">
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Calculando portfolio...</p>
        </CardContent>
      </Card>
    );
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
          onExportCSV={exportPortfolio}
          onExportPDF={handleGeneratePDFReport}
        />
      </div>

      <RealTimeRates rates={rates} onRefresh={calculatePortfolio} />
    </div>
  );
}
