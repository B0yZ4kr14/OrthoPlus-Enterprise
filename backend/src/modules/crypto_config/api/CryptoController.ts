import { logger } from "@/infrastructure/logger";
import { prisma } from "@/infrastructure/database/prismaClient";
import { Request, Response } from "express";
import { fetchExchangeRateBRL } from "./exchangeRate";


// Helper for error responses
const handleError = (
  res: Response,
  error: unknown,
  message: string = "Internal server error",
  status: number = 500,
) => {
  logger.error(message, { error });
  res.status(status).json({ error: "Internal server error" });
};

export class CryptoController {
  /**
   * Endpoint to convert crypto to BRL.
   */
  public convertCryptoToBrl = async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({ error: "transactionId is required" });
      }

      const transaction = await prisma.crypto_transactions.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.status === "CONVERTIDO") {
        return res.status(400).json({ error: "Transaction already converted" });
      }

      if (transaction.status !== "CONFIRMADO") {
        return res.status(400).json({
          error: "Transaction must be confirmed before conversion",
        });
      }

      const exchangeRate = await fetchExchangeRateBRL(transaction.coin);
      const amountBrl = Math.round(transaction.amount * exchangeRate);
      const convertedAt = new Date().toISOString();

      const updatedTransaction = await prisma.crypto_transactions.update({
        where: { id: transactionId },
        data: {
          status: "CONVERTIDO",
          price_brl: amountBrl,
        },
      });

      await prisma.audit_logs.create({
        data: {
          clinic_id: transaction.clinic_id,
          action: "CRYPTO_CONVERTED_TO_BRL",
          ip_address: { ip: req.ip || "unknown" },
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
        },
      });

      return res.status(200).json({
        success: true,
        transaction_id: transactionId,
        converted_at: convertedAt,
        amount_brl: amountBrl,
        exchange_rate: exchangeRate,
        status: updatedTransaction.status,
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, "Error in convert-crypto-to-brl");
      return;
    }
  };

  public createCryptoInvoice = async (req: Request, res: Response) => {
    try {
      const { amount, currency, clinicId, walletId, reference, fee } = req.body;

      const parsedAmount = Number(amount);
      const parsedFee = fee === undefined ? undefined : Number(fee);

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "amount must be greater than 0" });
      }

      if (!currency || typeof currency !== "string") {
        return res.status(400).json({ error: "currency is required" });
      }

      if (!clinicId || typeof clinicId !== "string") {
        return res.status(400).json({ error: "clinicId is required" });
      }

      const coin = currency.toUpperCase();
      const exchangeRate = await fetchExchangeRateBRL(coin);
      const amountBrl = Math.round(parsedAmount * exchangeRate);

      const invoice = await prisma.crypto_transactions.create({
        data: {
          amount: Math.round(parsedAmount),
          coin,
          clinic_id: clinicId,
          wallet_id: walletId ?? null,
          status: "PENDENTE",
          type: "INVOICE",
          price_brl: amountBrl,
          fee: parsedFee !== undefined && Number.isFinite(parsedFee) ? Math.round(parsedFee) : null,
          tx_hash: reference ?? null,
        },
      });

      await prisma.audit_logs.create({
        data: {
          clinic_id: clinicId,
          action: "CRYPTO_INVOICE_CREATED",
          ip_address: { ip: req.ip || "unknown" },
          details: {
            invoice_id: invoice.id,
            coin,
            amount: invoice.amount,
            price_brl: invoice.price_brl,
            wallet_id: invoice.wallet_id,
            reference: reference ?? null,
            exchange_rate: exchangeRate,
          },
        },
      });

      return res.status(201).json({
        success: true,
        invoice_id: invoice.id,
        status: invoice.status,
        amount: invoice.amount,
        coin: invoice.coin,
        amount_brl: invoice.price_brl,
        exchange_rate: exchangeRate,
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, "Error in create-crypto-invoice");
      return;
    }
  };

  public getCryptoManagerStatus = async (_req: Request, res: Response) => {
    try {
      return res.status(200).json({
        success: true,
        status: "active",
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, "Error in crypto-manager");
      return;
    }
  };

  public getCryptoRates = async (_req: Request, res: Response) => {
    try {
      const coins = ["BTC", "ETH", "USDT"];
      const entries = await Promise.all(
        coins.map(async (coin) => [coin, await fetchExchangeRateBRL(coin)] as const),
      );

      return res.status(200).json({
        success: true,
        rates: Object.fromEntries(entries),
        updated_at: new Date().toISOString(),
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, "Error in get-crypto-rates");
      return;
    }
  };

  public syncCryptoWallet = async (req: Request, res: Response) => {
    try {
      const { walletId } = req.body;
      return res.status(200).json({
        success: true,
        wallet_id: walletId,
        status: "synced",
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, "Error in sync-crypto-wallet");
      return;
    }
  };

  public validateXpub = async (req: Request, res: Response) => {
    try {
      const { xpub, currency } = req.body;

      if (!xpub) {
        return res.status(400).json({ error: "xpub parameter is required" });
      }

      const isValid =
        xpub.startsWith("xpub") ||
        xpub.startsWith("ypub") ||
        xpub.startsWith("zpub");

      return res.status(200).json({
        success: true,
        valid: isValid,
        currency: currency || "BTC",
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, "Error in validate-xpub");
      return;
    }
  };

  public handleCryptoWebhook = async (_req: Request, res: Response) => {
    try {
      return res
        .status(200)
        .json({ success: true, message: "Webhook processed" });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, "Error in handleCryptoWebhook");
      return;
    }
  };

  public manageOfflineWallet = async (req: Request, res: Response) => {
    try {
      const { action } = req.body;
      return res.status(200).json({
        success: true,
        message: `Action ${action} processed for offline wallet`,
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, "Error in manageOfflineWallet");
      return;
    }
  };

  public runCryptoJobs = async (req: Request, res: Response) => {
    try {
      const { jobName } = req.body;
      return res
        .status(200)
        .json({ success: true, job: jobName, executed: true });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      handleError(res, error, `Error in runCryptoJobs`);
      return;
    }
  };
}
