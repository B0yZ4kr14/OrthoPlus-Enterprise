import { prisma } from "@/infrastructure/database/prismaClient";
import { ICryptoConfigRepository } from "../domain/repositories/ICryptoConfigRepository";

export class CryptoConfigRepository implements ICryptoConfigRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createOfflineWallet(data: Record<string, unknown>) {
    return prisma.crypto_offline_wallets.create({ data: data as any });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateTransaction(id: string, clinicId: string, data: Record<string, unknown>) {
    await prisma.crypto_transactions.updateMany({ where: { id, clinic_id: clinicId }, data: data as any });
    return prisma.crypto_transactions.findFirst({ where: { id, clinic_id: clinicId } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createTransaction(data: Record<string, unknown>) {
    return prisma.crypto_transactions.create({ data: data as any });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateWallet(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.crypto_wallets.updateMany({ where: { id, clinic_id: clinicId }, data: data as any });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAuditLog(data: Record<string, unknown>) {
    return prisma.audit_logs.create({ data: data as any });
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
