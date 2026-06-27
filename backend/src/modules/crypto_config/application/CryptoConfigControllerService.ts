import { z } from "zod";
import { CryptoConfigRepository } from "@/modules/crypto_config/infrastructure/CryptoConfigRepository";
import { ExchangeConfig } from "@/modules/crypto_config/domain/entities/ExchangeConfig";
import { fetchExchangeRateBRL } from "@/modules/crypto_config/api/exchangeRate";
import { Errors } from "@/middleware/errorHandler";

export class CryptoConfigControllerService {
  constructor(
    private cryptoRepo: CryptoConfigRepository = new CryptoConfigRepository(),
  ) {}

  listExchanges(clinicId: string) {
    const exchanges = [
      new ExchangeConfig({
        id: crypto.randomUUID(),
        clinicId,
        exchangeType: "BINANCE",
        apiKey: "[CONFIGURE_VIA_DASHBOARD]",
        apiSecret: "[CONFIGURE_VIA_DASHBOARD]",
        isActive: true,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];
    return exchanges.map((e) => e.toJSON());
  }

  createExchange(clinicId: string, body: unknown, isAdmin: boolean) {
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

    const data = schema.parse(body);

    if (!clinicId || !isAdmin) {
      throw Errors.forbidden("Acesso negado");
    }

    const exchange = new ExchangeConfig({
      id: crypto.randomUUID(),
      clinicId,
      exchangeType: data.exchangeType,
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      isActive: true,
      lastSyncAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      exchange: exchange.toJSON(),
      message: "Exchange configurada com sucesso",
    };
  }

  getPortfolio() {
    return {
      totalValueUSD: 15250.75,
      assets: [
        { symbol: "BTC", amount: 0.5, valueUSD: 13000.0, allocation: 85.2 },
        { symbol: "ETH", amount: 2.5, valueUSD: 2000.5, allocation: 13.1 },
        { symbol: "USDT", amount: 250.25, valueUSD: 250.25, allocation: 1.7 },
      ],
      lastUpdated: new Date(),
    };
  }

  getDCAStrategies() {
    return [
      {
        id: crypto.randomUUID(),
        asset: "BTC",
        amountBRL: 500,
        frequency: "WEEKLY",
        isActive: true,
        nextExecutionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  async manageOfflineWallet(
    body: {
      action: string;
      address: string;
      currency: string;
      network: string;
      label?: string;
    },
    authClinicId?: string,
  ) {
    const { action, address, currency, network, label } = body;

    if (action !== "create") {
      throw Errors.validation("Invalid action");
    }

    // SECURITY: ignore any clinicId from body; only accept token clinicId
    const clinicId = authClinicId;
    if (!clinicId) {
      throw Errors.validation("clinicId is required");
    }

    if (!address || !currency || !network) {
      throw Errors.validation("address, currency and network are required");
    }

    const newWallet = await this.cryptoRepo.createOfflineWallet({
      address,
      clinic_id: clinicId,
      currency: currency.toUpperCase(),
      network: network.toUpperCase(),
      label: label ?? null,
    });

    return { wallet: newWallet };
  }

  validateXpub(xpub: string) {
    if (!xpub || !xpub.match(/^(xpub|ypub|zpub|tpub)/)) {
      throw Errors.validation("xPub invalido");
    }
    const mockAddress = `bc1q${Math.random().toString(36).substring(2, 42)}`;
    return { address: mockAddress };
  }

  syncCryptoWallet(walletId: string) {
    const balance = 0.5;
    const exchangeRate = 350000;
    const balanceBRL = balance * exchangeRate;

    return {
      wallet_id: walletId,
      balance,
      balance_brl: balanceBRL,
      exchange_rate: exchangeRate,
    };
  }

  realtimeNotify() {
    return {
      message: "Websocket setup instructed via WS server ideally.",
    };
  }

  async webhookCryptoTransaction(
    payload: Record<string, unknown>,
    authClinicId: string | undefined,
    ipAddress: string | undefined,
  ) {
    const walletAddress = payload.wallet_address ?? payload.address;
    const coin = (payload.coin_type ?? payload.coin ?? "")
      .toString()
      .toUpperCase();
    const txHash = payload.transaction_hash ?? payload.tx_hash;
    // SECURITY: ignore clinic_id from webhook payload; rely on authenticated clinic context
    const clinicId = authClinicId;
    const confirmations = Number(payload.confirmations) || 0;
    const amountRaw = Number(payload.amount);
    const feeRaw =
      payload.network_fee === undefined
        ? undefined
        : Number(payload.network_fee);

    if (!walletAddress || !coin || !txHash || !Number.isFinite(amountRaw)) {
      throw Errors.validation("Missing or invalid transaction data");
    }

    const wallet = await this.cryptoRepo.findWalletByAddressAndCoin(
      walletAddress as string,
      coin,
    );

    if (!wallet) {
      throw Errors.notFound("Wallet");
    }

    const status = confirmations >= 1 ? "CONFIRMADO" : "PENDENTE";
    const exchangeRate = await fetchExchangeRateBRL(coin);
    const amount = Math.round(amountRaw);
    const amountBrl = Math.round(amountRaw * exchangeRate);
    const fee =
      feeRaw !== undefined && Number.isFinite(feeRaw)
        ? Math.round(feeRaw)
        : null;

    const existingTx = await this.cryptoRepo.findTransactionByTxHash(
      txHash as string,
    );

    const transaction = existingTx
      ? await this.cryptoRepo.updateTransaction(existingTx.id, wallet.clinic_id as string, {
          amount,
          coin,
          price_brl: amountBrl,
          status,
          fee,
          wallet_id: wallet.id,
          clinic_id: wallet.clinic_id,
          exchange_id: (payload.exchange_id as string) ?? null,
        })
      : await this.cryptoRepo.createTransaction({
          amount,
          coin,
          clinic_id: wallet.clinic_id ?? clinicId,
          exchange_id: (payload.exchange_id as string) ?? null,
          fee,
          price_brl: amountBrl,
          status,
          tx_hash: txHash as string,
          type: "RECEBIMENTO",
          wallet_id: wallet.id,
        });

    if (status === "CONFIRMADO") {
      const currentBalance = wallet.balance ?? 0;
      await this.cryptoRepo.updateWallet(wallet.id, wallet.clinic_id as string, {
        balance: currentBalance + amount,
      });
    }

    await this.cryptoRepo.createAuditLog({
      clinic_id: wallet.clinic_id ?? clinicId,
      action: "CRYPTO_TRANSACTION_WEBHOOK",
      ip_address: { ip: ipAddress || "unknown" },
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
    });

    return {
      confirmations,
      status,
      transaction_id: transaction!.id,
    };
  }

  generatePaymentAddress(
    clinicId: string,
    coin_type?: string,
    wallet_id?: string,
  ) {
    const address = `${coin_type?.toLowerCase() || "btc"}_${wallet_id || clinicId}_${Date.now()}`;
    return {
      address,
      coin_type: coin_type || "BTC",
      wallet_id: wallet_id || null,
      created_at: new Date().toISOString(),
    };
  }
}
