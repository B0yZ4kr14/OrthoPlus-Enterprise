import { prisma } from "@/infrastructure/database/prismaClient";
import { ICRMRepository } from "../domain/repositories/ICRMRepository";

export class CRMRepository implements ICRMRepository {
  async findManyLeads(where: Record<string, unknown>) {
    return prisma.crm_leads.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async findLeadById(id: string, clinicId: string) {
    return prisma.crm_leads.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createLead(data: Record<string, unknown>) {
    return prisma.crm_leads.create({ data: data as any });
  }

  async updateLead(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.crm_leads.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteLead(id: string, clinicId: string) {
    await prisma.crm_leads.delete({ where: { id, clinic_id: clinicId } });
  }
}
