// cspell:disable
import { logger } from "@/lib/logger";
import { getMarketChartRange } from "@/lib/api/cryptoMarketApi";
import type { MarketComparison } from "./types";

export async function fetchMarketComparison(
  startDate: Date,
  endDate: Date,
): Promise<MarketComparison> {
  try {
    const prices = await getMarketChartRange(
      "bitcoin",
      Math.floor(startDate.getTime() / 1000),
      Math.floor(endDate.getTime() / 1000),
    );

    if (prices.length === 0) throw new Error("Erro ao buscar dados do Bitcoin");

    const btcStartPrice = prices[0].price;
    const btcEndPrice = prices[prices.length - 1].price;
    const btcReturn = ((btcEndPrice - btcStartPrice) / btcStartPrice) * 100;

    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
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
