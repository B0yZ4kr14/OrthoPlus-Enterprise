import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";
import { IMarketingRepository } from "@/modules/marketing/domain/repositories/IMarketingRepository";

export class MarketingRepository implements IMarketingRepository {
  // marketing_campaigns
  async listCampaigns(clinicId: string, status?: string) {
    const where: Prisma.marketing_campaignsWhereInput = { clinic_id: clinicId };
    if (status) where.status = status;
    return prisma.marketing_campaigns.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async getCampaignById(id: string, clinicId: string) {
    return prisma.marketing_campaigns.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createCampaign(data: Prisma.marketing_campaignsCreateInput) {
    return prisma.marketing_campaigns.create({ data });
  }

  async updateCampaign(
    id: string,
    data: Prisma.marketing_campaignsUpdateInput,
  ) {
    return prisma.marketing_campaigns.update({ where: { id }, data });
  }

  async deleteCampaign(id: string, clinicId: string) {
    return prisma.marketing_campaigns.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }

  // campanha_envios
  async listEnvios(where: Prisma.campanha_enviosWhereInput) {
    return prisma.campanha_envios.findMany({
      where,
      orderBy: { enviado_em: "desc" },
    });
  }

  async createEnvio(data: Prisma.campanha_enviosCreateInput) {
    return prisma.campanha_envios.create({ data });
  }

  async countEnvios(where: Prisma.campanha_enviosWhereInput) {
    return prisma.campanha_envios.count({ where });
  }

  // recalls
  async listRecalls(clinicId: string, tipoRecall?: string) {
    const where: Prisma.recallsWhereInput = { clinic_id: clinicId };
    if (tipoRecall) where.tipo_recall = tipoRecall;
    return prisma.recalls.findMany({
      where,
      orderBy: { data_prevista: "desc" },
    });
  }

  async createRecall(data: Prisma.recallsCreateInput) {
    return prisma.recalls.create({ data });
  }

  async updateRecall(id: string, data: Prisma.recallsUpdateInput) {
    return prisma.recalls.update({ where: { id }, data });
  }

  // campaign_triggers
  async findActiveTriggers(clinicId: string): Promise<any[]> {
    return prisma.campaign_triggers.findMany({
      where: {
        is_active: true,
        campaign: {
          clinic_id: clinicId,
          status: "ACTIVE",
        },
      },
      include: { campaign: true },
      take: 100,
    });
  }

  // appointments
  async findAppointmentsByDateRange(
    clinicId: string,
    start: Date,
    end: Date,
  ): Promise<any[]> {
    return prisma.appointments.findMany({
      where: {
        clinic_id: clinicId,
        status: "concluido",
        end_time: { gte: start.toISOString(), lte: end.toISOString() },
      },
      include: {
        patient: { select: { id: true, full_name: true, email: true } },
      },
      distinct: ["patient_id"],
      take: 500,
    });
  }

  async findRecentAppointmentPatientIds(
    clinicId: string,
    since: Date,
  ): Promise<any[]> {
    return prisma.appointments.findMany({
      where: {
        clinic_id: clinicId,
        start_time: { gte: since.toISOString() },
      },
      select: { patient_id: true },
      distinct: ["patient_id"],
    });
  }

  // patients
  async findPatientsByIds(clinicId: string, ids: string[]) {
    return prisma.patients.findMany({
      where: { clinic_id: clinicId, id: { in: ids } },
      select: { id: true, full_name: true, email: true },
    });
  }

  async findPatientsNotInIds(clinicId: string, ids: string[]) {
    return prisma.patients.findMany({
      where: { clinic_id: clinicId, id: { notIn: ids } },
      select: { id: true, full_name: true, email: true },
      take: 500,
    });
  }

  async findPatientsByBirthday(clinicId: string, month: number, day: number) {
    return prisma.$queryRaw<
      Array<{ patient_id: string; patient_name: string; email: string | null }>
    >`
      SELECT p.id AS patient_id, p.full_name AS patient_name, p.email
      FROM patients p
      WHERE p.clinic_id = ${clinicId}
        AND EXTRACT(MONTH FROM p.birth_date) = ${month}
        AND EXTRACT(DAY FROM p.birth_date) = ${day}
      LIMIT 500
    `;
  }

  // notifications
  async createNotification(data: Prisma.notificationsCreateInput) {
    return prisma.notifications.create({ data });
  }
}
