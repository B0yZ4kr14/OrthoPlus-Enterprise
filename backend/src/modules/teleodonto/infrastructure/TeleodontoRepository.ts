import { prisma } from "@/infrastructure/database/prismaClient"
import { Prisma } from "@prisma/client"
import { ITeleodontoRepository } from "@/modules/teleodonto/domain/repositories/ITeleodontoRepository"

export class TeleodontoRepository implements ITeleodontoRepository {
  async listTeleconsultas(clinicId: string) {
    return prisma.teleconsultas.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    })
  }

  async getTeleconsultaById(id: string, clinicId: string) {
    return prisma.teleconsultas.findFirst({
      where: { id, clinic_id: clinicId },
    })
  }

  async createTeleconsulta(data: Prisma.teleconsultasCreateInput) {
    return prisma.teleconsultas.create({ data })
  }

  async updateTeleconsulta(id: string, data: Prisma.teleconsultasUpdateInput) {
    return prisma.teleconsultas.update({ where: { id }, data })
  }

  async deleteTeleconsultasByIdAndClinic(id: string, clinicId: string) {
    return prisma.teleconsultas.deleteMany({ where: { id, clinic_id: clinicId } })
  }
}
