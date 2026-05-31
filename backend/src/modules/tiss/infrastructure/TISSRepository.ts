import { prisma } from "@/infrastructure/database/prismaClient";
import { ITISSRepository } from "../domain/repositories/ITISSRepository";

export class TISSRepository implements ITISSRepository {
  async findManyGuias(
    where: Record<string, unknown>,
    orderBy?: Record<string, unknown>,
    take?: number,
  ) {
    return prisma.tiss_guides.findMany({
      where,
      orderBy: orderBy ?? { created_at: "desc" },
      take: take ?? 1000,
    });
  }

  async findGuiaById(id: string, clinicId: string) {
    return prisma.tiss_guides.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createGuia(data: Record<string, unknown>) {
    return prisma.tiss_guides.create({ data: data as any });
  }

  async updateGuia(id: string, data: Record<string, unknown>) {
    return prisma.tiss_guides.update({ where: { id }, data });
  }

  async deleteGuia(id: string, clinicId: string) {
    await prisma.tiss_guides.deleteMany({ where: { id, clinic_id: clinicId } });
  }

  async updateManyGuias(
    where: Record<string, unknown>,
    data: Record<string, unknown>,
  ) {
    const result = await prisma.tiss_guides.updateMany({ where, data });
    return result.count;
  }

  async groupByGuias(args: Record<string, unknown>) {
    return prisma.tiss_guides.groupBy(args as any);
  }

  async aggregateGuias(args: Record<string, unknown>) {
    return prisma.tiss_guides.aggregate(args as any);
  }

  async findManyLotes(where: Record<string, unknown>) {
    return prisma.tiss_batches.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 1000,
    });
  }

  async findLoteById(id: string, clinicId: string) {
    return prisma.tiss_batches.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createLote(data: Record<string, unknown>) {
    return prisma.tiss_batches.create({ data: data as any });
  }

  async updateLote(id: string, data: Record<string, unknown>) {
    return prisma.tiss_batches.update({ where: { id }, data });
  }

  async deleteLote(id: string, clinicId: string) {
    await prisma.tiss_batches.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }

  async countGuiasInLote(loteId: string, clinicId: string) {
    return prisma.tiss_guides.count({
      where: { batch_id: loteId, clinic_id: clinicId },
    });
  }

  async findManyBatches(where: Record<string, unknown>) {
    return prisma.tiss_batches.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 1000,
    });
  }

  async findBatchById(id: string, clinicId: string) {
    return prisma.tiss_batches.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createBatch(data: Record<string, unknown>) {
    return prisma.tiss_batches.create({ data: data as any });
  }

  async updateBatch(id: string, data: Record<string, unknown>) {
    return prisma.tiss_batches.update({ where: { id }, data });
  }

  async groupByBatches(args: Record<string, unknown>) {
    return prisma.tiss_batches.groupBy(args as any);
  }

  async findManyConvenios(clinicId: string) {
    return prisma.tiss_convenios.findMany({
      where: { clinic_id: clinicId },
      orderBy: { nome: "asc" },
    });
  }

  async findConvenioById(id: string, clinicId: string) {
    return prisma.tiss_convenios.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createConvenio(data: Record<string, unknown>) {
    return prisma.tiss_convenios.create({ data: data as any });
  }

  async updateConvenio(id: string, data: Record<string, unknown>) {
    return prisma.tiss_convenios.update({ where: { id }, data });
  }

  async deleteConvenio(id: string, clinicId: string) {
    await prisma.tiss_convenios.deleteMany({ where: { id, clinic_id: clinicId } });
  }

  async findManyPacienteConvenios(where: Record<string, unknown>) {
    return prisma.paciente_convenios.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 1000,
    });
  }

  async findPacienteConvenioById(id: string, clinicId: string) {
    return prisma.paciente_convenios.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createPacienteConvenio(data: Record<string, unknown>) {
    return prisma.paciente_convenios.create({ data: data as any });
  }

  async updatePacienteConvenio(id: string, data: Record<string, unknown>) {
    return prisma.paciente_convenios.update({ where: { id }, data });
  }

  async deletePacienteConvenio(id: string, clinicId: string) {
    await prisma.paciente_convenios.deleteMany({ where: { id, clinic_id: clinicId } });
  }
}
