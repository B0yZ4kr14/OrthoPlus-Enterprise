/**
 * BTCPay Server Adapter (Self-Hosted, Non-Custodial)
 * Integração completa com BTCPay Server para pagamentos Bitcoin
 */

import { ICryptoExchange } from "./ExchangeFactory";
import crypto from "crypto";

export interface BTCPayInvoice {
  id: string;
  checkoutLink: string;
  status: string;
  amount: number;
  currency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  expirationTime: Date;
  paymentAddress: string;
  qrCodeData: string;
}

export class BTCPayAdapter implements ICryptoExchange {
  private baseUrl: string;
  private storeId: string;
  private apiKey: string;

  constructor(baseUrl: string, storeId: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.storeId = storeId;
    this.apiKey = apiKey;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/stores/${this.storeId}`,
        {
          headers: {
            Authorization: `token ${this.apiKey}`,
          },
        },
      );

      return response.ok;
    } catch (error) {
      console.error("BTCPay validation error:", error);
      return false;
    }
  }

  async createInvoice(params: {
    amount: number;
    currency: string;
    orderId: string;
    buyerEmail?: string;
    redirectUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<BTCPayInvoice> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/stores/${this.storeId}/invoices`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: params.amount.toString(),
            currency: params.currency,
            orderId: params.orderId,
            checkout: {
              redirectURL: params.redirectUrl,
              paymentMethods: ["BTC", "BTC-LightningNetwork"],
            },
            metadata: {
              buyerEmail: params.buyerEmail,
              ...params.metadata,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`BTCPay API Error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        checkoutLink: data.checkoutLink,
        status: data.status,
        amount: params.amount,
        currency: params.currency,
        cryptoAmount: 0, // Será preenchido após seleção de método
        cryptoCurrency: "BTC",
        expirationTime: new Date(data.expirationTime),
        paymentAddress: "",
        qrCodeData: `bitcoin:?amount=${params.amount}`,
      };
    } catch (error) {
      console.error("BTCPay CreateInvoice Error:", error);
      throw new Error("Falha ao criar invoice BTCPay");
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/stores/${this.storeId}/invoices/${invoiceId}`,
        {
          headers: {
            Authorization: `token ${this.apiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`BTCPay API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error("BTCPay GetInvoiceStatus Error:", error);
      throw error;
    }
  }

  validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    return signature === expectedSignature;
  }

  // Métodos ICryptoExchange (para compatibilidade)
  async getWalletBalance(coin: string): Promise<number> {
    // BTCPay Server não expõe saldo via API (non-custodial)
    return 0;
  }

  async generateDepositAddress(coin: string): Promise<string> {
    // Endereços são gerados por invoice
    throw new Error("Use createInvoice para gerar endereço de pagamento");
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/stores/${this.storeId}/rates?storeId=${this.storeId}&currencyPair=${from}_${to}`,
      );

      if (!response.ok) throw new Error("Failed to fetch rate");

      const data = await response.json();
      return parseFloat(data.rate || "0");
    } catch (error) {
      console.error("Error fetching BTCPay rate:", error);
      throw error;
    }
  }
}
