import { prisma } from "@/infrastructure/database/prismaClient";
import { ICryptoConfigRepository } from "../domain/repositories/ICryptoConfigRepository";

export class CryptoConfigRepository implements ICryptoConfigRepository {
  async createOfflineWallet(data: any) {
    return prisma.crypto_offline_wallets.create({ data });
  }

  async findWalletByAddress(address: string, clinicId: string) {
    return prisma.crypto_wallets.findFirst({
      where: { address, clinic_id: clinicId },
    });
  }

  async findWalletByAddressAndCoin(address: string, coin: string) {
    return prisma.crypto_wallets.findFirst({
      where: { address, coin },
    });
  }

  async findTransactionByTxHash(txHash: string) {
    return prisma.crypto_transactions.findFirst({
      where: { tx_hash: txHash },
    });
  }

  async updateTransaction(id: string, data: any) {
    return prisma.crypto_transactions.update({ where: { id }, data });
  }

  async createTransaction(data: any) {
    return prisma.crypto_transactions.create({ data });
  }

  async updateWallet(id: string, data: any) {
    return prisma.crypto_wallets.update({ where: { id }, data });
  }

  async createAuditLog(data: any) {
    return prisma.audit_logs.create({ data });
  }

  async findActiveVolatilityAlerts() {
    return prisma.crypto_price_alerts.findMany({
      where: {
        alert_type: "VOLATILITY",
        is_active: true,
      },
    }) as Promise<
      Array<{
        id: string;
        clinic_id: string;
        coin_type: string;
        alert_type: string;
        is_active: boolean;
        [key: string]: unknown;
      }>
    >;
  }

  async updateAlertTriggeredAt(id: string, triggeredAt: string) {
    return prisma.crypto_price_alerts.update({
      where: { id },
      data: { last_triggered_at: triggeredAt },
    });
  }

  async createNotification(data: {
    clinic_id: string;
    tipo: string;
    titulo: string;
    mensagem: string;
    link_acao: string;
    lida: boolean;
  }) {
    return prisma.notifications.create({ data });
  }
}
