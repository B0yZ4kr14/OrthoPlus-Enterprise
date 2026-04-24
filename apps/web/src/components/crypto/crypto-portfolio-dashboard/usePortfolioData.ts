import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
import type {
  CryptoWallet,
  CryptoTransaction,
} from "@/modules/crypto/types/crypto.types";
import type { PortfolioData } from "./types";
import { DEFAULT_RATES, COIN_IDS, getCoinColor } from "./types";

export function usePortfolioData(
  wallets: CryptoWallet[],
  transactions: CryptoTransaction[],
) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);

  const fetchRealRates = useCallback(async (): Promise<Record<string, number>> => {
    try {
      const coins = Object.values(COIN_IDS);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(",")}&vs_currencies=brl`,
      );

      if (!response.ok) throw new Error("Erro ao buscar cotações");

      const data = await response.json();

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

  return {
    portfolioData,
    loading,
    rates,
    refresh: calculatePortfolio,
  };
}
