import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
import { getBTCTicker, getUSDRates } from "@/lib/api/cryptoMarketApi";
import type { MarketRate, UseMarketRatesReturn } from "../types";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useMarketRates(): UseMarketRatesReturn {
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarketRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [btcData, usdData] = await Promise.all([
        getBTCTicker(),
        getUSDRates(),
      ]);

      setRates([
        {
          name: "Bitcoin",
          symbol: "BTC",
          price: parseFloat(btcData.lastPrice),
          change24h: parseFloat(btcData.priceChangePercent),
        },
        {
          name: "Dólar Americano",
          symbol: "USD",
          price: usdData.rates.BRL,
          change24h: 0,
        },
      ]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Error fetching market rates:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketRates();
    const interval = setInterval(fetchMarketRates, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMarketRates]);

  return {
    rates,
    loading,
    error,
    refetch: fetchMarketRates,
  };
}
