import { prisma } from "@/infrastructure/database/prismaClient";
import { IInadimplenciaRepository } from "../domain/repositories/IInadimplenciaRepository";

export class InadimplenciaRepository implements IInadimplenciaRepository {
  async findManyInadimplentes(where: Record<string, unknown>) {
    return prisma.inadimplentes.findMany({
      where,
      orderBy: { valor_total_devido: "desc" },
    });
  }

  async findInadimplenteById(id: string, clinicId: string) {
    return prisma.inadimplentes.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateInadimplente(id: string, clinicId: string, data: Record<string, unknown>) {
    await prisma.inadimplentes.updateMany({ where: { id, clinic_id: clinicId }, data });
    return prisma.inadimplentes.findFirst({ where: { id, clinic_id: clinicId } });
  }

  async findManyCampanhas(where: Record<string, unknown>) {
    return prisma.campanhas_inadimplencia.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createCampanha(data: Record<string, unknown>) {
    return prisma.campanhas_inadimplencia.create({ data: data as any });
  }

  async findCampanhaById(id: string, clinicId: string) {
    return prisma.campanhas_inadimplencia.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateCampanha(id: string, clinicId: string, data: Record<string, unknown>) {
    await prisma.campanhas_inadimplencia.updateMany({ where: { id, clinic_id: clinicId }, data: data as any });
    return prisma.campanhas_inadimplencia.findFirst({ where: { id, clinic_id: clinicId } });
  }
}
