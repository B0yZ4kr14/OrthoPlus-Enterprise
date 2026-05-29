// cspell:disable
import { useState, useCallback } from "react";
import { subDays } from "date-fns";
import type {
  CoinType,
  ExchangeRate,
  HistoricalData,
  BestMoment,
} from "./types";
import { EXCHANGES, COIN_RATES } from "./types";

function buildHistoricalData(coinType: CoinType): {
  data: HistoricalData[];
  bestMoment: BestMoment;
} {
  const days = 30;
  const baseRate = COIN_RATES[coinType];
  const data: HistoricalData[] = [];

  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const variation = (Math.random() - 0.5) * (baseRate * 0.05);
    const rate = baseRate + variation;

    data.push({
      date,
      rate,
      variation: (variation / baseRate) * 100,
    });
  }

  const maxRate = Math.max(...data.map((d) => d.rate));
  const currentRate = data[data.length - 1].rate;
  const percentageFromMax = ((currentRate - maxRate) / maxRate) * 100;

  const bestMoment: BestMoment = {
    maxRate,
    currentRate,
    percentageFromMax,
    recommendation:
      percentageFromMax > -5
        ? "CONVERTER_AGORA"
        : percentageFromMax > -15
          ? "AGUARDAR"
          : "EXCELENTE_MOMENTO",
  };

  return { data, bestMoment };
}

function buildExchangeRates(
  coinType: CoinType,
  amount: string,
): ExchangeRate[] {
  const baseRate = COIN_RATES[coinType];
  const amountNum = parseFloat(amount) || 1;

  const rates: ExchangeRate[] = EXCHANGES.map((exchange) => {
    const rateVariation = (Math.random() - 0.5) * (baseRate * 0.01);
    const rate = baseRate + rateVariation;
    const grossAmount = rate * amountNum;
    const feeAmount = grossAmount * (exchange.baseFee / 100);
    const netAmount = grossAmount - feeAmount;

    return {
      exchange: exchange.name,
      rate,
      fee: exchange.baseFee,
      netAmount,
      color: exchange.color,
    };
  });

  rates.sort((a, b) => b.netAmount - a.netAmount);
  return rates;
}

export function useConversionSimulator() {
  const [coinType, setCoinType] = useState<CoinType>("BTC");
  const [amount, setAmount] = useState<string>("1");
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [bestMoment, setBestMoment] = useState<BestMoment | null>(null);

  const refreshSimulation = useCallback(() => {
    const { data, bestMoment } = buildHistoricalData(coinType);
    setHistoricalData(data);
    setBestMoment(bestMoment);
    setExchangeRates(buildExchangeRates(coinType, amount));
  }, [coinType, amount]);

  return {
    coinType,
    setCoinType,
    amount,
    setAmount,
    historicalData,
    exchangeRates,
    bestMoment,
    refreshSimulation,
  };
}
