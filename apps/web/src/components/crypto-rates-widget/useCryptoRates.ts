import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import type { CryptoRate } from "./types";

interface CryptoRatesResponse {
  rates: CryptoRate[];
}

export function useCryptoRates() {
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.post<CryptoRatesResponse>(
        "/crypto/rates",
        {},
      );

      const data = response as unknown as CryptoRatesResponse;
      setRates((data.rates || []).slice(0, 4));
      setLastUpdate(new Date());
    } catch (error) {
      logger.error("Error fetching crypto rates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRates();
    const interval = setInterval(() => {
      void fetchRates();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  return {
    rates,
    loading,
    lastUpdate,
    fetchRates,
  };
}
