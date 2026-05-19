/**
 * Tipos compartilhados para adapters de Exchange
 *
 * Extraídos de ExchangeFactory.ts para quebrar dependências circulares.
 * Constitution AP-1: Camadas devem ser independentes.
 */

export interface ICryptoExchange {
  getWalletBalance(coin: string): Promise<number>;
  generateDepositAddress(coin: string): Promise<string>;
  getExchangeRate(from: string, to: string): Promise<number>;
  validateCredentials(): Promise<boolean>;
}

export type ExchangeName =
  | "BINANCE"
  | "COINBASE"
  | "KRAKEN"
  | "MERCADO_BITCOIN"
  | "BTCPAY";
