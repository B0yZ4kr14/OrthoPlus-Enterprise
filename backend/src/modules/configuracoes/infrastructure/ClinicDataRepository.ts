import { prisma } from "@/infrastructure/database/prismaClient";

export class ClinicDataRepository {
  async findPatientsByClinic(clinicId: string) {
    try {
      return await prisma.patients.findMany({
        where: { clinic_id: clinicId },
      });
    } catch {
      return [];
    }
  }
}
