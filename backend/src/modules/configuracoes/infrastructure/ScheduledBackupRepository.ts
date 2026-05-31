import { prisma } from "@/infrastructure/database/prismaClient";
import { IScheduledBackupRepository } from "../domain/repositories/IScheduledBackupRepository";

export class ScheduledBackupRepository implements IScheduledBackupRepository {
  async findMany(clinicId: string) {
    return prisma.scheduled_backups.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
  }

  async update(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.scheduled_backups.update({ where: { id, clinic_id: clinicId }, data });
  }

  async delete(id: string, clinicId: string) {
    await prisma.scheduled_backups.delete({ where: { id, clinic_id: clinicId } });
  }
}
