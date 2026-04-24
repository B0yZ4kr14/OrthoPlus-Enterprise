// cspell:disable

export type CoinType = "BTC" | "ETH" | "USDT";

export interface BacktestResult {
  date: string;
  dcaValue: number;
  lumpSumValue: number;
  dcaInvested: number;
  dcaCoin: number;
  lumpSumCoin: number;
}

export interface BacktestSummary {
  dcaFinalValue: number;
  lumpSumFinalValue: number;
  dcaTotalInvested: number;
  lumpSumTotalInvested: number;
  dcaReturn: number;
  lumpSumReturn: number;
  dcaTotalCoin: number;
  lumpSumTotalCoin: number;
}

export interface MonthlyPrice {
  date: Date;
  price: number;
}
