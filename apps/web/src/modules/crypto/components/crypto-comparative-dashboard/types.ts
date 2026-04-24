// cspell:disable

export interface CryptoTransaction {
  status: string;
  amount_brl?: number;
  processing_fee_brl?: number;
  net_amount_brl?: number;
}

export interface CryptoStats {
  totalBRL: number;
  totalFees: number;
  netAmount: number;
  count: number;
}

export interface ComparisonMethod {
  method: string;
  fee: number;
  feePercentage: number;
  netAmount: number;
  color: string;
}

export interface SavingsData {
  method: string;
  savings: number;
  savingsPercentage: number;
}

export interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

export const TRADITIONAL_FEES = {
  PIX: 0.99,
  CREDIT_CARD: 3.99,
  DEBIT_CARD: 2.49,
  BOLETO: 3.49,
} as const;
