/**
 * Coinbase Exchange Adapter
 * Integração com Coinbase API
 */

import { ICryptoExchange } from "./ExchangeFactory";

export class CoinbaseAdapter implements ICryptoExchange {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.coinbase.com/v2";

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Coinbase validation error:", error);
      return false;
    }
  }

  async getWalletBalance(coin: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch balance");

      const data = await response.json();
      const account = data.data.find((acc: unknown) => acc.currency === coin);

      return parseFloat(account?.balance?.amount || "0");
    } catch (error) {
      console.error("Error fetching Coinbase balance:", error);
      throw error;
    }
  }

  async generateDepositAddress(coin: string): Promise<string> {
    try {
      // Get account ID for the coin
      const accountsResponse = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const accountsData = await accountsResponse.json();
      const account = accountsData.data.find(
        (acc: unknown) => acc.currency === coin,
      );

      if (!account) throw new Error(`Account for ${coin} not found`);

      // Generate deposit address
      const response = await fetch(
        `${this.baseUrl}/accounts/${account.id}/addresses`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "OrthoPlus Deposit" }),
        },
      );

      if (!response.ok) throw new Error("Failed to generate address");

      const data = await response.json();
      return data.data.address;
    } catch (error) {
      console.error("Error generating Coinbase deposit address:", error);
      throw error;
    }
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/exchange-rates?currency=${from}`,
      );

      if (!response.ok) throw new Error("Failed to fetch exchange rate");

      const data = await response.json();
      return parseFloat(data.data.rates[to] || "0");
    } catch (error) {
      console.error("Error fetching Coinbase exchange rate:", error);
      throw error;
    }
  }
}
