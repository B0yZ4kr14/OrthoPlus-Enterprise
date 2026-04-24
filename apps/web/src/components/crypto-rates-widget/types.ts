export interface CryptoRate {
  symbol: string;
  name: string;
  price_brl: number;
  price_usd: number;
  change_24h: number;
  volume_24h: number;
  last_updated: string;
}
