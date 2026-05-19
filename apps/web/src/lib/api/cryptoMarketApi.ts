/**
 * Crypto Market API Client
 *
 * Cliente para APIs externas de cotação de criptomoedas (CoinGecko, Binance).
 * Substitui chamadas raw `fetch()` nos componentes crypto.
 *
 * Constitution AP-3: Toda comunicação HTTP deve usar abstrações centralizadas.
 */

import axios from "axios";

// ─── CoinGecko ───

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

const coingeckoClient = axios.create({
  baseURL: COINGECKO_BASE,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

export interface SimplePriceResponse {
  [coinId: string]: {
    [currency: string]: number;
  };
}

export interface MarketChartPoint {
  timestamp: number;
  price: number;
}

/**
 * Busca preço atual de uma ou mais moedas (simple/price).
 * Replaces raw fetch in: CryptoCalculator, CryptoPortfolioDashboard, usePortfolioData
 */
export async function getSimplePrice(
  coinIds: string[],
  vsCurrencies: string[] = ["brl"],
): Promise<SimplePriceResponse> {
  const ids = coinIds.join(",");
  const vs = vsCurrencies.join(",");
  const { data } = await coingeckoClient.get<SimplePriceResponse>(
    `/simple/price?ids=${ids}&vs_currencies=${vs}`,
  );
  return data;
}

/**
 * Busca histórico de preços (market_chart/range) para backtesting e relatórios.
 * Replaces raw fetch in: marketData.ts, useDCABacktesting, CryptoPerformanceReport, DCABacktesting
 */
export async function getMarketChartRange(
  coinId: string,
  from: number, // Unix timestamp (seconds)
  to: number, // Unix timestamp (seconds)
  vsCurrency = "brl",
): Promise<MarketChartPoint[]> {
  const { data } = await coingeckoClient.get<{
    prices: [number, number][];
  }>(
    `/coins/${coinId}/market_chart/range?vs_currency=${vsCurrency}&from=${from}&to=${to}`,
  );
  return data.prices.map(([timestamp, price]) => ({
    timestamp,
    price,
  }));
}

// ─── Binance ───

const BINANCE_BASE = "https://api.binance.com/api/v3";

const binanceClient = axios.create({
  baseURL: BINANCE_BASE,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

export interface BinanceTicker24h {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
}

/**
 * Busca ticker 24h do BTC/BRL na Binance.
 * Replaces raw fetch in: useMarketRates, MarketRatesWidget
 */
export async function getBTCTicker(): Promise<BinanceTicker24h> {
  const { data } = await binanceClient.get<BinanceTicker24h>(
    "/ticker/24hr?symbol=BTCBRL",
  );
  return data;
}

// ─── ExchangeRate-API ───

const EXCHANGERATE_BASE = "https://api.exchangerate-api.com/v4";

const exchangeRateClient = axios.create({
  baseURL: EXCHANGERATE_BASE,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

/**
 * Busca taxa de câmbio USD → outras moedas.
 * Replaces raw fetch in: useMarketRates, MarketRatesWidget
 */
export async function getUSDRates(): Promise<ExchangeRateResponse> {
  const { data } = await exchangeRateClient.get<ExchangeRateResponse>(
    "/latest/USD",
  );
  return data;
}

// ─── Coin mapping helper ───

const COIN_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  USDC: "usd-coin",
};

export function getCoinGeckoId(coinType: string): string {
  return COIN_ID_MAP[coinType] || coinType.toLowerCase();
}
