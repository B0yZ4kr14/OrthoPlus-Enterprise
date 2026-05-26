import { Prisma } from "@prisma/client"
import type {
  marketing_campaigns,
  campanha_envios,
  recalls,
  patients,
  notifications,
} from "@prisma/client"

/**
 * IMarketingRepository — interface for marketing module database access.
 * Decouples MarketingController from Prisma / infrastructure details.
 */
export interface IMarketingRepository {
  // marketing_campaigns
  listCampaigns(clinicId: string, status?: string): Promise<marketing_campaigns[]>
  getCampaignById(id: string, clinicId: string): Promise<marketing_campaigns | null>
  createCampaign(data: Prisma.marketing_campaignsCreateInput): Promise<marketing_campaigns>
  updateCampaign(id: string, data: Prisma.marketing_campaignsUpdateInput): Promise<marketing_campaigns>
  deleteCampaign(id: string, clinicId: string): Promise<Prisma.BatchPayload>

  // campanha_envios
  listEnvios(where: Prisma.campanha_enviosWhereInput): Promise<campanha_envios[]>
  createEnvio(data: Prisma.campanha_enviosCreateInput): Promise<campanha_envios>
  countEnvios(where: Prisma.campanha_enviosWhereInput): Promise<number>

  // recalls
  listRecalls(clinicId: string, tipoRecall?: string): Promise<recalls[]>
  createRecall(data: Prisma.recallsCreateInput): Promise<recalls>
  updateRecall(id: string, data: Prisma.recallsUpdateInput): Promise<recalls>

  // campaign_triggers
  findActiveTriggers(clinicId: string): Promise<any[]>

  // appointments
  findAppointmentsByDateRange(clinicId: string, start: Date, end: Date): Promise<any[]>
  findRecentAppointmentPatientIds(clinicId: string, since: Date): Promise<any[]>

  // patients
  findPatientsByIds(clinicId: string, ids: string[]): Promise<Pick<patients, "id" | "full_name" | "email">[]>
  findPatientsNotInIds(clinicId: string, ids: string[]): Promise<Pick<patients, "id" | "full_name" | "email">[]>
  findPatientsByBirthday(clinicId: string, month: number, day: number): Promise<Array<{ patient_id: string; patient_name: string; email: string | null }>>

  // notifications
  createNotification(data: Prisma.notificationsCreateInput): Promise<notifications>
}
