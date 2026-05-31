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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAuditLog(data: Record<string, unknown>) {
    return prisma.audit_logs.create({ data: data as any });
  }
}
