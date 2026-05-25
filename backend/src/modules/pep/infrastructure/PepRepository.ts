import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";

export class PepRepository {
  async createProntuario(data: Prisma.prontuariosCreateInput) {
    return prisma.prontuarios.create({ data });
  }

  async findProntuariosByPatientAndClinic(patientId: string, clinicId: string) {
    return prisma.prontuarios.findMany({
      where: {
        clinic_id: clinicId,
        patient_id: patientId,
      },
      orderBy: { created_at: "desc" },
    });
  }

  async createAssinatura(data: Prisma.pep_assinaturasCreateInput) {
    return prisma.pep_assinaturas.create({ data });
  }
}
