/**
 * Kraken Exchange Adapter
 * Integração com Kraken API
 */

import { ICryptoExchange } from "./ExchangeFactory";
import crypto from "crypto";

export class KrakenAdapter implements ICryptoExchange {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.kraken.com";

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private generateSignature(
    path: string,
    nonce: number,
    postData: string,
  ): string {
    const message =
      path +
      crypto
        .createHash("sha256")
        .update(nonce + postData)
        .digest();
    const signature = crypto
      .createHmac("sha512", Buffer.from(this.apiSecret, "base64"))
      .update(message)
      .digest("base64");

    return signature;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const nonce = Date.now();
      const path = "/0/private/Balance";
      const postData = `nonce=${nonce}`;

      const signature = this.generateSignature(path, nonce, postData);

      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "API-Key": this.apiKey,
          "API-Sign": signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: postData,
      });

      const data = await response.json();
      return data.error.length === 0;
    } catch (error) {
      console.error("Kraken validation error:", error);
      return false;
    }
  }

  async getWalletBalance(coin: string): Promise<number> {
    try {
      const nonce = Date.now();
      const path = "/0/private/Balance";
      const postData = `nonce=${nonce}`;

      const signature = this.generateSignature(path, nonce, postData);

      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "API-Key": this.apiKey,
          "API-Sign": signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: postData,
      });

      if (!response.ok) throw new Error("Failed to fetch balance");

      const data = await response.json();
      const krakenCoin = `X${coin}`; // Kraken usa prefixo X para algumas moedas

      return parseFloat(data.result[krakenCoin] || data.result[coin] || "0");
    } catch (error) {
      console.error("Error fetching Kraken balance:", error);
      throw error;
    }
  }

  async generateDepositAddress(coin: string): Promise<string> {
    try {
      const nonce = Date.now();
      const path = "/0/private/DepositAddresses";
      const postData = `nonce=${nonce}&asset=${coin}&method=Bitcoin`;

      const signature = this.generateSignature(path, nonce, postData);

      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "API-Key": this.apiKey,
          "API-Sign": signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: postData,
      });

      if (!response.ok) throw new Error("Failed to generate address");

      const data = await response.json();
      return data.result[0]?.address || "";
    } catch (error) {
      console.error("Error generating Kraken deposit address:", error);
      throw error;
    }
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      const pair = `${from}${to}`;
      const response = await fetch(
        `${this.baseUrl}/0/public/Ticker?pair=${pair}`,
      );

      if (!response.ok) throw new Error("Failed to fetch exchange rate");

      const data = await response.json();
      const pairKey = Object.keys(data.result)[0];

      return parseFloat(data.result[pairKey]?.c[0] || "0");
    } catch (error) {
      console.error("Error fetching Kraken exchange rate:", error);
      throw error;
    }
  }
}
