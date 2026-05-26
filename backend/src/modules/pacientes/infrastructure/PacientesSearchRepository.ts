import { prisma } from "@/infrastructure/database/prismaClient"
import {
  IPacientesSearchRepository,
  SearchPatientsParams,
} from "@/modules/pacientes/domain/repositories/IPacientesSearchRepository"

export class PacientesSearchRepository implements IPacientesSearchRepository {
  async searchPatients(params: SearchPatientsParams): Promise<Record<string, unknown>[]> {
    return prisma.patients.findMany({
      where: params.where,
      orderBy: params.orderBy,
      skip: params.skip,
      take: params.take,
      select: params.select,
    }) as Promise<Record<string, unknown>[]>
  }

  async countPatients(where: Record<string, unknown>) {
    return prisma.patients.count({ where })
  }
}
