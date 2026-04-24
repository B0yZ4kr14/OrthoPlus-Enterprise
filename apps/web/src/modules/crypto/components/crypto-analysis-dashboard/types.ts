// cspell:disable
export interface ExchangeRate {
  id: number;
  coin_type: string;
  rate_brl: number;
  rate_usd: number;
  source: string;
  timestamp: string;
}

export interface Transaction {
  id: number;
  amount_crypto: number;
  amount_brl: number;
  exchange_rate_at_transaction: number;
  status: string;
  confirmed_at: string;
  coin_type: string;
}

export interface CandlestickDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RateHistoryData {
  date: string;
  BTC: number | null;
  ETH: number | null;
  USDT: number | null;
}

export interface VolumeData {
  date: string;
  volume: number;
  count: number;
}

export interface SavingsComparisonData {
  método: string;
  taxa: number;
  custo: number;
}

export interface AnalysisStats {
  currentRate: number;
  previousRate: number;
  rateChange: number;
  totalTransactions: number;
  totalVolumeBRL: number;
  totalVolumeCrypto: number;
  traditionalFees: number;
  cryptoFees: number;
  savings: number;
  savingsPercent: string;
  lowestRate: number;
  highestRate: number;
  optimalConversionRate: number;
}
