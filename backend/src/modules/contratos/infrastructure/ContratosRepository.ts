import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";
import { IContratosRepository } from "@/modules/contratos/domain/repositories/IContratosRepository";

export class ContratosRepository implements IContratosRepository {
  async listContratos(clinicId: string) {
    return prisma.contratos.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
  }

  async getContratoById(id: string, clinicId: string) {
    return prisma.contratos.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createContrato(data: Prisma.contratosCreateInput) {
    return prisma.contratos.create({ data });
  }

  async updateContrato(id: string, data: Prisma.contratosUpdateInput) {
    return prisma.contratos.update({ where: { id }, data });
  }

  async deleteContrato(id: string) {
    return prisma.contratos.delete({ where: { id } });
  }

  async listTemplates() {
    return prisma.contrato_templates.findMany({
      orderBy: { nome: "asc" },
    });
  }
}
