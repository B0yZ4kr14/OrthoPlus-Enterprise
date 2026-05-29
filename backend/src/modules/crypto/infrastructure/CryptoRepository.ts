import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";

export class CryptoRepository {
  async findTransactionById(id: string) {
    return prisma.crypto_transactions.findUnique({ where: { id } });
  }

  async updateTransaction(
    id: string,
    data: Prisma.crypto_transactionsUpdateInput,
  ) {
    return prisma.crypto_transactions.update({ where: { id }, data });
  }

  async createTransaction(data: Prisma.crypto_transactionsCreateInput) {
    return prisma.crypto_transactions.create({ data });
  }

  async createAuditLog(data: any) {
    return prisma.audit_logs.create({ data });
  }
}
