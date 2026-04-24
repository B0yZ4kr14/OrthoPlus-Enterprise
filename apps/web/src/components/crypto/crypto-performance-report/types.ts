// cspell:disable

export interface PortfolioData {
  totalBRL: number;
  totalCrypto: { [key: string]: number };
  distribution: { coin: string; value: number; percentage: number }[];
  gains: number;
  losses: number;
  conversionsHistory: ConversionHistory[];
}

export interface ConversionHistory {
  id: string;
  date: Date;
  fromCoin: string;
  toCoin: string;
  amount: number;
  rate: number;
  valueBRL: number;
  type: "gain" | "loss";
}

export interface MarketComparison {
  btcReturn: number;
  sp500Return: number;
  portfolioReturn: number;
}

export interface SummaryItem {
  label: string;
  value: string;
}
