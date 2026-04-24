import type {
  CryptoWallet,
  CryptoTransaction,
} from "@/modules/crypto/types/crypto.types";

export interface CryptoPortfolioDashboardProps {
  wallets: CryptoWallet[];
  transactions: CryptoTransaction[];
}

export interface PortfolioData {
  totalBRL: number;
  totalCrypto: Record<string, number>;
  distribution: DistributionItem[];
  gains: number;
  losses: number;
  conversionsHistory: ConversionHistoryItem[];
}

export interface DistributionItem {
  coin: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ConversionHistoryItem {
  id: string;
  date: Date;
  fromCoin: string;
  toCoin: string;
  amount: number;
  rate: number;
  valueBRL: number;
  type: "gain" | "loss";
}

export const DEFAULT_RATES: Record<string, number> = {
  BTC: 350000,
  ETH: 18000,
  USDT: 5.5,
  BNB: 1500,
  USDC: 5.5,
};

export const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  USDC: "usd-coin",
};

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getCoinColor(coin: string): string {
  const colors: Record<string, string> = {
    BTC: "#F7931A",
    ETH: "#627EEA",
    USDT: "#26A17B",
    BNB: "#F3BA2F",
    USDC: "#2775CA",
  };
  return colors[coin] || "#6B7280";
}
