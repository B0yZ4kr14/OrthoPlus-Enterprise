import { prisma } from "@/infrastructure/database/prismaClient";

export class AuditLogRepository {
  async findLogs(options: { where?: any; orderBy?: any; take?: number }) {
    return prisma.audit_logs.findMany(options);
  }

  async createLog(data: any) {
    return prisma.audit_logs.create({ data });
  }

  async findProfiles(options: { where?: any; select?: any; orderBy?: any }) {
    return prisma.profiles.findMany(options);
  }
}
