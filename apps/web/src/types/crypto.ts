export interface ChartDataItem {
  timestamp: Date;
  price: number;
  volume: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
  sma?: number;
  upperBand?: number;
  lowerBand?: number;
}

export interface TechnicalIndicatorResults {
  rsi: number;
  rsiSignal: "SOBRECOMPRA" | "SOBREVENDA" | "NEUTRO";
  macd: number;
  macdSignal: "ALTA" | "BAIXA";
  trend: "ALTA" | "BAIXA";
  volatility: string;
}

export type CoinType = "BTC" | "ETH" | "USDT";
export type TimePeriod = "24h" | "7d" | "30d" | "1y";

export interface CryptoWallet {
  id?: string;
  coin_type: string;
  balance: number;
  is_active: boolean;
}

export interface CryptoTransaction {
  id?: string;
  status: string;
  coin_type: string;
  amount_crypto: number;
  amount_brl: number;
  net_amount_brl?: number;
  exchange_rate: number;
  created_at: string;
}
