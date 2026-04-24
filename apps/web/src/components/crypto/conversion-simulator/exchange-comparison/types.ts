import type { ExchangeRate } from "../types";

export type { ExchangeRate };

export interface ExchangeComparisonProps {
  rates: ExchangeRate[];
  amount: string;
}

export interface ExchangeRateRowProps {
  rate: ExchangeRate;
  index: number;
  amountNum: number;
  isBest: boolean;
  savings?: number;
}
