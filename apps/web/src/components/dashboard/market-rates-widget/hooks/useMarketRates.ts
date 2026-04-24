import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
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
      // Buscar Bitcoin (BRL)
      const btcResponse = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCBRL"
      );
      const btcData = await btcResponse.json();

      // Buscar USD (BRL) usando API pública
      const usdResponse = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const usdData = await usdResponse.json();
      const usdRate = usdData.rates.BRL;

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
          price: usdRate,
          change24h: 0, // Exchange rate API não fornece variação
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
