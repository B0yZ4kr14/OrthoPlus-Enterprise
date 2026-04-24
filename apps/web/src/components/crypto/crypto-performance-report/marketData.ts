// cspell:disable
import { logger } from "@/lib/logger";
import type { MarketComparison } from "./types";

export async function fetchMarketComparison(
  startDate: Date,
  endDate: Date
): Promise<MarketComparison> {
  try {
    const btcResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=brl&from=${Math.floor(
        startDate.getTime() / 1000
      )}&to=${Math.floor(endDate.getTime() / 1000)}`
    );

    if (!btcResponse.ok) throw new Error("Erro ao buscar dados do Bitcoin");

    const btcData = await btcResponse.json();
    const btcPrices = btcData.prices;
    const btcStartPrice = btcPrices[0][1];
    const btcEndPrice = btcPrices[btcPrices.length - 1][1];
    const btcReturn = ((btcEndPrice - btcStartPrice) / btcStartPrice) * 100;

    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const monthsDiff = daysDiff / 30;
    const sp500Return = monthsDiff * 1.0;

    return {
      btcReturn,
      sp500Return,
      portfolioReturn: 0,
    };
  } catch (error) {
    logger.error("Erro ao buscar comparação de mercado:", error);
    return {
      btcReturn: 0,
      sp500Return: 0,
      portfolioReturn: 0,
    };
  }
}
