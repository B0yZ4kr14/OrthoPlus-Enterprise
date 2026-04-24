import type { CryptoWallet } from "@/modules/crypto/types/crypto.types";

export interface CryptoPaymentSelectorProps {
  amount: number;
  onPaymentConfirmed: (txHash: string, cryptoCurrency: string) => void;
}

export interface PaymentData {
  address: string;
  qrData: string;
  amount: number;
  coin: string;
}

export type CoinType = "BTC" | "ETH" | "USDT" | "BNB";

export interface CombinedWallet extends CryptoWallet {
  type: "exchange" | "offline";
}

export const COIN_OPTIONS: Array<{ value: CoinType; label: string }> = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "BNB", label: "Binance Coin (BNB)" },
];
