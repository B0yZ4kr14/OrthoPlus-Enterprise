// cspell:disable

export type CoinType = "BTC" | "ETH" | "USDT";
export type Recommendation = "CONVERTER_AGORA" | "AGUARDAR" | "EXCELENTE_MOMENTO";

export interface ExchangeRate {
  exchange: string;
  rate: number;
  fee: number;
  netAmount: number;
  color: string;
}

export interface HistoricalData {
  date: Date;
  rate: number;
  variation: number;
}

export interface BestMoment {
  maxRate: number;
  currentRate: number;
  percentageFromMax: number;
  recommendation: Recommendation;
}

export interface ExchangeConfig {
  name: string;
  baseFee: number;
  color: string;
}

export const EXCHANGES: ExchangeConfig[] = [
  { name: "Binance", baseFee: 0.1, color: "#F3BA2F" },
  { name: "Coinbase", baseFee: 0.5, color: "#0052FF" },
  { name: "Kraken", baseFee: 0.26, color: "#5741D9" },
  { name: "Bybit", baseFee: 0.1, color: "#F7A600" },
  { name: "Mercado Bitcoin", baseFee: 0.3, color: "#00B8E6" },
];

export const COIN_RATES: Record<CoinType, number> = {
  BTC: 350000,
  ETH: 18000,
  USDT: 5.5,
};
