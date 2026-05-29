export interface PortfolioDistributionItem {
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

export interface PortfolioData {
  totalBRL: number;
  totalCrypto: Record<string, number>;
  distribution: PortfolioDistributionItem[];
  gains: number;
  losses: number;
  conversionsHistory: ConversionHistoryItem[];
}

export const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  USDT: "#26A17B",
  BNB: "#F3BA2F",
  USDC: "#2775CA",
};

export function getCoinColor(coin: string): string {
  return COIN_COLORS[coin] || "#666";
}

export function getCoinBgClass(coin: string): string {
  return COIN_COLORS[coin]
    ? `bg-[${COIN_COLORS[coin]}]`
    : "bg-muted-foreground";
}

export function getCoinBorderClass(coin: string): string {
  return COIN_COLORS[coin] ? `border-[${COIN_COLORS[coin]}]/20` : "";
}

export function getCoinTextClass(coin: string): string {
  return COIN_COLORS[coin] ? `text-[${COIN_COLORS[coin]}]` : "";
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
