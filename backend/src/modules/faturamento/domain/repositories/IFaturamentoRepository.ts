import { Prisma } from "@prisma/client"
import type { nfe_records } from "@prisma/client"

/**
 * IFaturamentoRepository — interface for faturamento module database access.
 * Decouples service layer from Prisma / infrastructure details.
 */
export interface IFaturamentoRepository {
  createNFe(data: Prisma.nfe_recordsCreateInput): Promise<nfe_records>
  findNFesByClinic(clinicId: string): Promise<nfe_records[]>
  updateNFeStatus(
    id: string,
    data: Prisma.nfe_recordsUpdateManyMutationInput,
  ): Promise<Prisma.BatchPayload>

  getConfig(clinicId: string): Promise<any | null>
  upsertConfig(clinicId: string, data: any): Promise<any>
  getRelatorio(clinicId: string, filters: { dataInicio?: string; dataFim?: string; tipo?: string }): Promise<any[]>
}
