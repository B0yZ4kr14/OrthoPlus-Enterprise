/**
 * Mercado Bitcoin Adapter (Brasil)
 * Integração com API brasileira de criptomoedas
 */

import { ICryptoExchange } from "./ExchangeFactory";

export class MercadoBitcoinAdapter implements ICryptoExchange {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.mercadobitcoin.net/api/v4";

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/balance`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Mercado Bitcoin validation error:", error);
      return false;
    }
  }

  async getWalletBalance(coin: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/balance`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch balance");

      const data = await response.json();
      const balance = data.find((b: unknown) => b.currency_id === coin);

      return parseFloat(balance?.available || "0");
    } catch (error) {
      console.error("Error fetching MB balance:", error);
      throw error;
    }
  }

  async generateDepositAddress(coin: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${coin.toLowerCase()}/deposit-address`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to generate address");

      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error("Error generating MB deposit address:", error);
      throw error;
    }
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      // Mercado Bitcoin usa pares tipo BTC-BRL
      const symbol = `${from}-${to}`.toUpperCase();
      const response = await fetch(`${this.baseUrl}/${symbol}/ticker`);

      if (!response.ok) throw new Error("Failed to fetch exchange rate");

      const data = await response.json();
      return parseFloat(data.last || "0");
    } catch (error) {
      console.error("Error fetching MB exchange rate:", error);
      throw error;
    }
  }
}
