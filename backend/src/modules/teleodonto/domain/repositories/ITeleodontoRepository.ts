import { Prisma } from "@prisma/client"
import type { teleconsultas } from "@prisma/client"

/**
 * ITeleodontoRepository — interface for teleodonto module database access.
 * Decouples TeleodontoService from Prisma / infrastructure details.
 */
export interface ITeleodontoRepository {
  listTeleconsultas(clinicId: string): Promise<teleconsultas[]>
  getTeleconsultaById(id: string, clinicId: string): Promise<teleconsultas | null>
  createTeleconsulta(data: Prisma.teleconsultasCreateInput): Promise<teleconsultas>
  updateTeleconsulta(id: string, data: Prisma.teleconsultasUpdateInput): Promise<teleconsultas>
  deleteTeleconsultasByIdAndClinic(id: string, clinicId: string): Promise<Prisma.BatchPayload>
}
