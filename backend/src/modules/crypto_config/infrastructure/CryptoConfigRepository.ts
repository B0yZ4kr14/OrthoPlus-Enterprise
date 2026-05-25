import { prisma } from "@/infrastructure/database/prismaClient"

export class CryptoConfigRepository {
  async createOfflineWallet(data: any) {
    return prisma.crypto_offline_wallets.create({ data })
  }

  async findWalletByAddress(address: string, clinicId: string) {
    return prisma.crypto_wallets.findFirst({
      where: { address, clinic_id: clinicId },
    })
  }

  async findWalletByAddressAndCoin(address: string, coin: string) {
    return prisma.crypto_wallets.findFirst({
      where: { address, coin },
    })
  }

  async findTransactionByTxHash(txHash: string) {
    return prisma.crypto_transactions.findFirst({
      where: { tx_hash: txHash },
    })
  }

  async updateTransaction(id: string, data: any) {
    return prisma.crypto_transactions.update({ where: { id }, data })
  }

  async createTransaction(data: any) {
    return prisma.crypto_transactions.create({ data })
  }

  async updateWallet(id: string, data: any) {
    return prisma.crypto_wallets.update({ where: { id }, data })
  }

  async createAuditLog(data: any) {
    return prisma.audit_logs.create({ data })
  }
}
