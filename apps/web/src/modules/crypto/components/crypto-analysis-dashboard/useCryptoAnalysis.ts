// cspell:disable
import { useState, useEffect, useMemo, useCallback } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import type {
  ExchangeRate,
  Transaction,
  CandlestickDataPoint,
  RateHistoryData,
  VolumeData,
  SavingsComparisonData,
  AnalysisStats,
} from "./types";

interface UseCryptoAnalysisProps {
  clinicId: string;
}

function generateMockCandlestickData(): CandlestickDataPoint[] {
  const data: CandlestickDataPoint[] = [];
  const now = new Date();
  let price = 320000 + Math.random() * 20000;

  for (let i = 96; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000);
    const open = price;
    const volatility = 2000 + Math.random() * 3000;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    const volume = 1000000 + Math.random() * 5000000;

    data.push({
      time: time.toISOString(),
      open,
      high,
      low,
      close,
      volume,
    });

    price = close + (Math.random() - 0.5) * 5000;
  }

  return data;
}

export function useCryptoAnalysis({ clinicId }: UseCryptoAnalysisProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [candlestickData, setCandlestickData] = useState<CandlestickDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalysisData = useCallback(async () => {
    try {
      const rates = await apiClient.get<ExchangeRate[]>(
        `/crypto/exchange-rates?since=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`,
      );

      const txs = await apiClient.get<Transaction[]>(
        `/crypto/transactions?clinic_id=${clinicId}&status=confirmed&limit=50`,
      );

      if (rates) setExchangeRates(rates);
      if (txs) setTransactions(txs);

      const candleData = await apiClient.get<Record<string, unknown>[]>(
        "/crypto/candlestick?coin_type=BTC&interval=15m&limit=100",
      );

      if (candleData && candleData.length > 0) {
        setCandlestickData(
          candleData.map((c) => ({
            time: String(c.open_time),
            open: parseFloat(String(c.open_price)),
            high: parseFloat(String(c.high_price)),
            low: parseFloat(String(c.low_price)),
            close: parseFloat(String(c.close_price)),
            volume: parseFloat(String(c.volume)),
          })),
        );
      } else {
        setCandlestickData(generateMockCandlestickData());
      }
    } catch (error) {
      logger.error("Error fetching analysis data:", error);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  const stats: AnalysisStats = useMemo(() => {
    const currentRate = exchangeRates[exchangeRates.length - 1]?.rate_brl || 0;
    const previousRate =
      exchangeRates[exchangeRates.length - 7]?.rate_brl || currentRate;
    const rateChange =
      previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;

    const totalTransactions = transactions.length;
    const totalVolumeBRL = transactions.reduce(
      (sum, tx) => sum + tx.amount_brl,
      0,
    );
    const totalVolumeCrypto = transactions.reduce(
      (sum, tx) => sum + tx.amount_crypto,
      0,
    );

    const traditionalFees = totalVolumeBRL * 0.035;
    const cryptoFees = totalVolumeBRL * 0.005;
    const savings = traditionalFees - cryptoFees;
    const savingsPercent =
      traditionalFees > 0 ? ((savings / traditionalFees) * 100).toFixed(1) : "0.0";

    const rates = exchangeRates.map((r) => r.rate_brl);
    const lowestRate = rates.length > 0 ? Math.min(...rates) : 0;
    const highestRate = rates.length > 0 ? Math.max(...rates) : 0;
    const optimalConversionRate = lowestRate + (highestRate - lowestRate) * 0.25;

    return {
      currentRate,
      previousRate,
      rateChange,
      totalTransactions,
      totalVolumeBRL,
      totalVolumeCrypto,
      traditionalFees,
      cryptoFees,
      savings,
      savingsPercent,
      lowestRate,
      highestRate,
      optimalConversionRate,
    };
  }, [exchangeRates, transactions]);

  const rateHistoryData: RateHistoryData[] = useMemo(() =>
    exchangeRates.map((rate) => ({
      date: new Date(rate.timestamp).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      BTC: rate.coin_type === "BTC" ? rate.rate_brl : null,
      ETH: rate.coin_type === "ETH" ? rate.rate_brl : null,
      USDT: rate.coin_type === "USDT" ? rate.rate_brl : null,
    })),
  [exchangeRates]);

  const volumeData: VolumeData[] = useMemo(() => {
    const volumeByDay = transactions.reduce(
      (acc, tx) => {
        const date = new Date(tx.confirmed_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
        if (!acc[date]) {
          acc[date] = { date, volume: 0, count: 0 };
        }
        acc[date].volume += tx.amount_brl;
        acc[date].count += 1;
        return acc;
      },
      {} as Record<string, VolumeData>,
    );

    return Object.values(volumeByDay).reverse();
  }, [transactions]);

  const savingsComparisonData: SavingsComparisonData[] = useMemo(
    () => [
      {
        método: "Tradicional",
        taxa: 3.5,
        custo: stats.traditionalFees,
      },
      { método: "Cripto", taxa: 0.5, custo: stats.cryptoFees },
    ],
    [stats.traditionalFees, stats.cryptoFees],
  );

  return {
    loading,
    exchangeRates,
    transactions,
    candlestickData,
    stats,
    rateHistoryData,
    volumeData,
    savingsComparisonData,
  };
}
