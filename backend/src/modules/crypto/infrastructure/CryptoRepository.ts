import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";

export class CryptoRepository {
  async findTransactionById(id: string, clinicId: string) {
    return prisma.crypto_transactions.findFirst({ where: { id, clinic_id: clinicId } });
  }

  async updateTransaction(
    id: string,
    clinicId: string,
    data: Prisma.crypto_transactionsUpdateInput,
  ) {
    await prisma.crypto_transactions.updateMany({ where: { id, clinic_id: clinicId }, data });
    return prisma.crypto_transactions.findFirst({ where: { id, clinic_id: clinicId } });
  }

  async createTransaction(data: Prisma.crypto_transactionsCreateInput) {
    return prisma.crypto_transactions.create({ data });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAuditLog(data: Record<string, unknown>) {
    return prisma.audit_logs.create({ data: data as any });
  }
}
