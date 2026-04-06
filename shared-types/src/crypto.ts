/**
 * Crypto Module Types
 */

export interface CryptoRate {
  coin: string;
  rate: number;
  change24h?: number;
  updated_at?: string;
}

export interface CryptoRatesResponse {
  rates: Record<string, number>;
  timestamp: string;
}

export interface CryptoConfig {
  id: string;
  coin_type: string;
  wallet_address?: string;
  wallet_name?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CryptoPayment {
  id: string;
  coin_type: string;
  amount: number;
  wallet_address: string;
  status: "pending" | "confirmed" | "expired";
  created_at: string;
  expires_at?: string;
}

export interface TechnicalAnalysis {
  rsi?: number;
  rsiSignal?: "buy" | "sell" | "neutral";
  macd?: number;
  macdSignal?: "bullish" | "bearish" | "neutral";
  trend?: "uptrend" | "downtrend" | "sideways";
  volatility?: number;
  support?: number;
  resistance?: number;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  fee?: number;
}

export interface CryptoAlert {
  id: string;
  coin_type: string;
  target_price: number;
  condition: "above" | "below";
  is_active: boolean;
  created_at: string;
}
