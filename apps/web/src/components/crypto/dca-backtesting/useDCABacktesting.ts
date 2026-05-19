// cspell:disable
import { useState, useCallback } from "react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from "@/lib/logger";
import { getMarketChartRange } from "@/lib/api/cryptoMarketApi";
import type { CoinType, BacktestResult, BacktestSummary, MonthlyPrice } from "./types";

const COIN_IDS: Record<CoinType, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
};

export function useDCABacktesting() {
  const [coinType, setCoinType] = useState<CoinType>("BTC");
  const [monthlyAmount, setMonthlyAmount] = useState(1000);
  const [period, setPeriod] = useState(12);
  const [results, setResults] = useState<BacktestResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<BacktestSummary | null>(null);

  const fetchHistoricalData = useCallback(async (
    coinId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number[][]> => {
    const prices = await getMarketChartRange(
      coinId,
      Math.floor(startDate.getTime() / 1000),
      Math.floor(endDate.getTime() / 1000),
    );
    return prices.map((p) => [p.timestamp, p.price]);
  }, []);

  const calculateMonthlyPrices = useCallback((
    prices: number[][],
    period: number,
    endDate: Date
  ): MonthlyPrice[] => {
    const monthlyPrices: MonthlyPrice[] = [];

    for (let i = 0; i < period; i++) {
      const targetDate = subMonths(endDate, period - i);
      const dayTimestamp = targetDate.getTime();

      let closestPrice = prices[0];
      let minDiff = Math.abs(prices[0][0] - dayTimestamp);

      for (const [timestamp, price] of prices) {
        const diff = Math.abs(timestamp - dayTimestamp);
        if (diff < minDiff) {
          minDiff = diff;
          closestPrice = [timestamp, price];
        }
      }

      monthlyPrices.push({
        date: new Date(closestPrice[0]),
        price: closestPrice[1],
      });
    }

    return monthlyPrices;
  }, []);

  const simulateBacktest = useCallback((
    monthlyPrices: MonthlyPrice[],
    monthlyAmount: number,
    lastPrice: number
  ): { results: BacktestResult[]; summary: BacktestSummary } => {
    let dcaTotalInvested = 0;
    let dcaTotalCoin = 0;

    const firstPrice = monthlyPrices[0].price;
    const lumpSumTotalInvested = monthlyAmount * monthlyPrices.length;
    const lumpSumTotalCoin = lumpSumTotalInvested / firstPrice;

    const backtestResults: BacktestResult[] = monthlyPrices.map((item) => {
      dcaTotalInvested += monthlyAmount;
      const coinsBought = monthlyAmount / item.price;
      dcaTotalCoin += coinsBought;

      const dcaCurrentValue = dcaTotalCoin * lastPrice;
      const lumpSumCurrentValue = lumpSumTotalCoin * lastPrice;

      return {
        date: format(item.date, "MMM/yy", { locale: ptBR }),
        dcaValue: dcaCurrentValue,
        lumpSumValue: lumpSumCurrentValue,
        dcaInvested: dcaTotalInvested,
        dcaCoin: dcaTotalCoin,
        lumpSumCoin: lumpSumTotalCoin,
      };
    });

    const finalResult = backtestResults[backtestResults.length - 1];
    const dcaFinalValue = finalResult.dcaValue;
    const lumpSumFinalValue = finalResult.lumpSumValue;

    return {
      results: backtestResults,
      summary: {
        dcaFinalValue,
        lumpSumFinalValue,
        dcaTotalInvested,
        lumpSumTotalInvested,
        dcaReturn: ((dcaFinalValue - dcaTotalInvested) / dcaTotalInvested) * 100,
        lumpSumReturn:
          ((lumpSumFinalValue - lumpSumTotalInvested) / lumpSumTotalInvested) * 100,
        dcaTotalCoin: finalResult.dcaCoin,
        lumpSumTotalCoin: finalResult.lumpSumCoin,
      },
    };
  }, []);

  const runBacktest = useCallback(async () => {
    setLoading(true);

    try {
      const endDate = new Date();
      const startDate = subMonths(endDate, period);
      const coinId = COIN_IDS[coinType];

      const prices = await fetchHistoricalData(coinId, startDate, endDate);
      const monthlyPrices = calculateMonthlyPrices(prices, period, endDate);
      const lastPrice = monthlyPrices[monthlyPrices.length - 1].price;

      const { results: backtestResults, summary: backtestSummary } = simulateBacktest(
        monthlyPrices,
        monthlyAmount,
        lastPrice
      );

      setResults(backtestResults);
      setSummary(backtestSummary);
    } catch (error) {
      logger.error("Erro no backtesting:", error);
    } finally {
      setLoading(false);
    }
  }, [coinType, monthlyAmount, period, fetchHistoricalData, calculateMonthlyPrices, simulateBacktest]);

  return {
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
  };
}
