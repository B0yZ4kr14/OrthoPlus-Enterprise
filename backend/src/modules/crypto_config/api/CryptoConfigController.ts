import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
/**
 * CryptoConfigController
 * API para configuração de exchanges, wallets e portfolio de criptomoedas
 */

import { Request, Response } from "express";
import { z } from "zod";
import { fetchExchangeRateBRL } from "./exchangeRate";
import { ExchangeConfig } from "../domain/entities/ExchangeConfig";


export class CryptoConfigController {
  async listExchanges(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      // Mock data
      const exchanges = [
        new ExchangeConfig({
          id: crypto.randomUUID(),
          clinicId,
          exchangeType: "BINANCE",
          apiKey: "binance_api_key_***",
          apiSecret: "encrypted_secret",
          isActive: true,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      res.json({
        exchanges: exchanges.map((e) => e.toJSON()),
      });
    } catch (error) {
      logger.error("Error listing exchanges", { error });
      res.status(500).json({ error: "Erro ao listar exchanges" });
    }
  }

  async createExchange(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        exchangeType: z.enum([
          "BINANCE",
          "COINBASE",
          "KRAKEN",
          "MERCADO_BITCOIN",
        ]),
        apiKey: z.string().min(10),
        apiSecret: z.string().min(10),
      });

      const data = schema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId || req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Acesso negado" });
        return;
      }

      const exchange = new ExchangeConfig({
        id: crypto.randomUUID(),
        clinicId,
        exchangeType: data.exchangeType,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret, // Em produção, criptografar antes de salvar
        isActive: true,
        lastSyncAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        exchange: exchange.toJSON(),
        message: "Exchange configurada com sucesso",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Dados inválidos", details: error.errors });
        return;
      }
      logger.error("Error creating exchange", { error });
      res.status(500).json({ error: "Erro ao configurar exchange" });
    }
  }

  async getPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      // Mock portfolio data
      const portfolio = {
        totalValueUSD: 15250.75,
        assets: [
          { symbol: "BTC", amount: 0.5, valueUSD: 13000.0, allocation: 85.2 },
          { symbol: "ETH", amount: 2.5, valueUSD: 2000.5, allocation: 13.1 },
          { symbol: "USDT", amount: 250.25, valueUSD: 250.25, allocation: 1.7 },
        ],
        lastUpdated: new Date(),
      };

      res.json({ portfolio });
    } catch (error) {
      logger.error("Error getting portfolio", { error });
      res.status(500).json({ error: "Erro ao obter portfolio" });
    }
  }

  async getDCAStrategies(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      // Mock DCA strategies
      const strategies = [
        {
          id: crypto.randomUUID(),
          asset: "BTC",
          amountBRL: 500,
          frequency: "WEEKLY",
          isActive: true,
          nextExecutionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ];

      res.json({ strategies });
    } catch (error) {
      logger.error("Error getting DCA strategies", { error });
      res.status(500).json({ error: "Erro ao obter estratégias DCA" });
    }
  }

  // Edge Function: manage-offline-wallet
  async manageOfflineWallet(req: Request, res: Response): Promise<void> {
    try {
      const {
        action,
        address,
        currency,
        network,
        label,
        clinicId: clinicIdBody,
      } = req.body;

      if (action !== "create") {
        res.status(400).json({ error: "Invalid action" });
        return;
      }

      const clinicId = clinicIdBody ?? req.user?.clinicId;

      if (!clinicId) {
        res.status(400).json({ error: "clinicId is required" });
        return;
      }

      if (!address || !currency || !network) {
        res.status(400).json({
          error: "address, currency and network are required",
        });
        return;
      }

      const newWallet = await prisma.crypto_offline_wallets.create({
        data: {
          address,
          clinic_id: clinicId,
          currency: currency.toUpperCase(),
          network: network.toUpperCase(),
          label: label ?? null,
        },
      });

      res.json({ success: true, wallet: newWallet });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Edge Function: validate-xpub
  async validateXpub(req: Request, res: Response): Promise<void> {
    try {
      const { xpub /*, derivationPath, index */ } = req.body;

      if (!xpub || !xpub.match(/^(xpub|ypub|zpub|tpub)/)) {
        throw new Error("xPub inválido");
      }

      const mockAddress = `bc1q${Math.random().toString(36).substring(2, 42)}`;
      res.json({ address: mockAddress });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(400).json({ error: "Bad request" });
    }
  }

  // Edge Function: sync-crypto-wallet
  async syncCryptoWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.body;

      if (!walletId) {
        res.status(400).json({ error: "walletId is required" });
        return;
      }

      // Simplified sync stub - In a real setup, would hit Binance/Coinbase API, update balance, and log to audit_logs
      const balance = 0.5;
      const exchangeRate = 350000;
      const balanceBRL = balance * exchangeRate;

      res.json({
        success: true,
        wallet_id: walletId,
        balance,
        balance_brl: balanceBRL,
        exchange_rate: exchangeRate,
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error("Error in sync-crypto-wallet", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Edge Function: crypto-realtime-notifications
  async realtimeNotify(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.query.clinicId;
      if (!clinicId) {
        res.status(400).json({ error: "Missing clinicId parameter" });
        return;
      }

      // Websocket endpoints in real environments often get handled by socket.io or separate ws server
      // This serves as an HTTP trigger to emulate the logic or just returning placeholder info
      res.json({
        success: true,
        message: "Websocket setup instructed via WS server ideally.",
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Edge Function: webhook-crypto-transaction
  async webhookCryptoTransaction(req: Request, res: Response): Promise<void> {
    try {
      // Stub implementation of webhook-crypto-transaction
      const payload = req.body;
      const webhookSignature = req.headers["x-webhook-signature"];

      if (!webhookSignature) {
        console.warn(
          "Webhook without signature - validation skipped for development",
        );
      }

      const walletAddress = payload.wallet_address ?? payload.address;
      const coin = (payload.coin_type ?? payload.coin ?? "").toUpperCase();
      const txHash = payload.transaction_hash ?? payload.tx_hash;
      const clinicId = payload.clinic_id ?? req.user?.clinicId;
      const confirmations = Number(payload.confirmations) || 0;
      const amountRaw = Number(payload.amount);
      const feeRaw = payload.network_fee === undefined ? undefined : Number(payload.network_fee);

      if (!walletAddress || !coin || !txHash || !Number.isFinite(amountRaw)) {
        res.status(400).json({ error: "Missing or invalid transaction data" });
        return;
      }

      const wallet = await prisma.crypto_wallets.findFirst({
        where: {
          address: walletAddress,
          coin,
        },
      });

      if (!wallet) {
        res.status(404).json({ error: "Wallet not found" });
        return;
      }

      const status = confirmations >= 1 ? "CONFIRMADO" : "PENDENTE";
      const exchangeRate = await fetchExchangeRateBRL(coin);
      const amount = Math.round(amountRaw);
      const amountBrl = Math.round(amountRaw * exchangeRate);
      const fee = feeRaw !== undefined && Number.isFinite(feeRaw) ? Math.round(feeRaw) : null;

      const existingTx = await prisma.crypto_transactions.findFirst({
        where: { tx_hash: txHash },
      });

      const transaction = existingTx
        ? await prisma.crypto_transactions.update({
            where: { id: existingTx.id },
            data: {
              amount,
              coin,
              price_brl: amountBrl,
              status,
              fee,
              wallet_id: wallet.id,
              clinic_id: wallet.clinic_id,
              exchange_id: payload.exchange_id ?? null,
            },
          })
        : await prisma.crypto_transactions.create({
            data: {
              amount,
              coin,
              clinic_id: wallet.clinic_id ?? clinicId,
              exchange_id: payload.exchange_id ?? null,
              fee,
              price_brl: amountBrl,
              status,
              tx_hash: txHash,
              type: "RECEBIMENTO",
              wallet_id: wallet.id,
            },
          });

      if (status === "CONFIRMADO") {
        const currentBalance = wallet.balance ?? 0;
        await prisma.crypto_wallets.update({
          where: { id: wallet.id },
          data: { balance: currentBalance + amount },
        });
      }

      await prisma.audit_logs.create({
        data: {
          clinic_id: wallet.clinic_id ?? clinicId,
          action: "CRYPTO_TRANSACTION_WEBHOOK",
          ip_address: { ip: req.ip || "unknown" },
          details: {
            transaction_hash: txHash,
            coin,
            amount,
            amount_brl: amountBrl,
            confirmations,
            exchange_rate: exchangeRate,
            status,
            wallet_id: wallet.id,
          },
        },
      });

      res.json({
        success: true,
        message: "Webhook processed successfully",
        confirmations,
        status,
        transaction_id: transaction.id,
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
