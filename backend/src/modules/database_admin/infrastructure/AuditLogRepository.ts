import { prisma } from "@/infrastructure/database/prismaClient";

export class AuditLogRepository {
  async findLogs(options: { where?: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }) {
    return prisma.audit_logs.findMany(options as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createLog(data: Record<string, unknown>) {
    return prisma.audit_logs.create({ data: data as any });
  }

  async findProfiles(options: { where?: Record<string, unknown>; select?: Record<string, unknown>; orderBy?: Record<string, unknown> }) {
    return prisma.profiles.findMany(options as any);
  }
}
