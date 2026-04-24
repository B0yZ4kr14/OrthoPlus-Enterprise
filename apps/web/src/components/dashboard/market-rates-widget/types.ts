export interface MarketRate {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

export interface UseMarketRatesReturn {
  rates: MarketRate[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
