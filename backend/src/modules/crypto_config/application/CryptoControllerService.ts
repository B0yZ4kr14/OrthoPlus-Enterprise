import { CryptoRepository } from "@/modules/crypto/infrastructure/CryptoRepository";
import { fetchExchangeRateBRL } from "@/modules/crypto_config/api/exchangeRate";

export class CryptoControllerService {
  constructor(private repo: CryptoRepository = new CryptoRepository()) {}

  async convertCryptoToBrl(transactionId: string, ipAddress?: string) {
    const transaction = await this.repo.findTransactionById(transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status === "CONVERTIDO") {
      throw new Error("Transaction already converted");
    }

    if (transaction.status !== "CONFIRMADO") {
      throw new Error("Transaction must be confirmed before conversion");
    }

    const exchangeRate = await fetchExchangeRateBRL(transaction.coin);
    const amountBrl = Math.round(transaction.amount * exchangeRate);
    const convertedAt = new Date().toISOString();

    const updatedTransaction = await this.repo.updateTransaction(
      transactionId,
      {
        status: "CONVERTIDO",
        price_brl: amountBrl,
      }
    );

    await this.repo.createAuditLog({
      clinic_id: transaction.clinic_id,
      action: "CRYPTO_CONVERTED_TO_BRL",
      ip_address: { ip: ipAddress || "unknown" },
      details: {
        transaction_id: transactionId,
        coin: transaction.coin,
        amount: transaction.amount,
        amount_brl: amountBrl,
        exchange_rate: exchangeRate,
        converted_at: convertedAt,
        status_before: transaction.status,
        status_after: updatedTransaction.status,
      },
    });

    return {
      transaction_id: transactionId,
      converted_at: convertedAt,
      amount_brl: amountBrl,
      exchange_rate: exchangeRate,
      status: updatedTransaction.status,
    };
  }

  async createCryptoInvoice(
    body: {
      amount: number;
      currency: string;
      clinicId: string;
      walletId?: string;
      reference?: string;
      fee?: number;
    },
    ipAddress?: string
  ) {
    const { amount, currency, clinicId, walletId, reference, fee } = body;

    const parsedAmount = Number(amount);
    const parsedFee = fee === undefined ? undefined : Number(fee);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error("amount must be greater than 0");
    }

    if (!currency || typeof currency !== "string") {
      throw new Error("currency is required");
    }

    if (!clinicId || typeof clinicId !== "string") {
      throw new Error("clinicId is required");
    }

    const coin = currency.toUpperCase();
    const exchangeRate = await fetchExchangeRateBRL(coin);
    const amountBrl = Math.round(parsedAmount * exchangeRate);

    const invoice = await this.repo.createTransaction({
      amount: Math.round(parsedAmount),
      coin,
      clinic_id: clinicId,
      wallet_id: walletId ?? null,
      status: "PENDENTE",
      type: "INVOICE",
      price_brl: amountBrl,
      fee: parsedFee !== undefined && Number.isFinite(parsedFee) ? Math.round(parsedFee) : null,
      tx_hash: reference ?? null,
    });

    await this.repo.createAuditLog({
      clinic_id: clinicId,
      action: "CRYPTO_INVOICE_CREATED",
      ip_address: { ip: ipAddress || "unknown" },
      details: {
        invoice_id: invoice.id,
        coin,
        amount: invoice.amount,
        price_brl: invoice.price_brl,
        wallet_id: invoice.wallet_id,
        reference: reference ?? null,
        exchange_rate: exchangeRate,
      },
    });

    return {
      invoice_id: invoice.id,
      status: invoice.status,
      amount: invoice.amount,
      coin: invoice.coin,
      amount_brl: invoice.price_brl,
      exchange_rate: exchangeRate,
    };
  }

  async getCryptoRates() {
    const coins = ["BTC", "ETH", "USDT"];
    const entries = await Promise.all(
      coins.map(async (coin) => [coin, await fetchExchangeRateBRL(coin)] as const),
    );

    return {
      rates: Object.fromEntries(entries),
      updated_at: new Date().toISOString(),
    };
  }

  validateXpub(xpub: string, currency?: string) {
    if (!xpub) {
      throw new Error("xpub parameter is required");
    }

    const isValid =
      xpub.startsWith("xpub") ||
      xpub.startsWith("ypub") ||
      xpub.startsWith("zpub");

    return { valid: isValid, currency: currency || "BTC" };
  }
}
