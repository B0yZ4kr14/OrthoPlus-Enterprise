import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";

export class FilesRepository {
  async createAuditLog(data: any) {
    return (prisma as any).audit_logs.create({ data });
  }

  async findBackupById(id: string) {
    return prisma.backup_history.findUnique({ where: { id } });
  }

  async updateBackup(id: string, data: Prisma.backup_historyUpdateInput) {
    return prisma.backup_history.update({ where: { id }, data });
  }
}
