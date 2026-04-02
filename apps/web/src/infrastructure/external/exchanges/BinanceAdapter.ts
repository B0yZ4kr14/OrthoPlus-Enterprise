/**
 * Binance Exchange Adapter
 * Integração com Binance API para operações crypto
 */

import { ICryptoExchange } from "./ExchangeFactory";
import crypto from "crypto";

export class BinanceAdapter implements ICryptoExchange {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.binance.com";

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private generateSignature(queryString: string): string {
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(queryString)
      .digest("hex");
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);

      const response = await fetch(
        `${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            "X-MBX-APIKEY": this.apiKey,
          },
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Binance validation error:", error);
      return false;
    }
  }

  async getWalletBalance(coin: string): Promise<number> {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);

      const response = await fetch(
        `${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            "X-MBX-APIKEY": this.apiKey,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch balance");

      const data = await response.json();
      const balance = data.balances.find((b: unknown) => b.asset === coin);

      return parseFloat(balance?.free || "0");
    } catch (error) {
      console.error("Error fetching Binance balance:", error);
      throw error;
    }
  }

  async generateDepositAddress(coin: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const queryString = `coin=${coin}&timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);

      const response = await fetch(
        `${this.baseUrl}/sapi/v1/capital/deposit/address?${queryString}&signature=${signature}`,
        {
          headers: {
            "X-MBX-APIKEY": this.apiKey,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to generate address");

      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error("Error generating Binance deposit address:", error);
      throw error;
    }
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      const symbol = `${from}${to}`;
      const response = await fetch(
        `${this.baseUrl}/api/v3/ticker/price?symbol=${symbol}`,
      );

      if (!response.ok) throw new Error("Failed to fetch exchange rate");

      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error("Error fetching Binance exchange rate:", error);
      throw error;
    }
  }
}
