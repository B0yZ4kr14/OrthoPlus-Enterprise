import { prisma } from "@/infrastructure/database/prismaClient";
import { IPepRepository } from "../domain/repositories/IPepRepository";

export class PepRepository implements IPepRepository {
  async createProntuario(data: Record<string, unknown>) {
    return prisma.prontuarios.create({ data: data as any });
  }

  async findProntuariosByPatientAndClinic(patientId: string, clinicId: string) {
    return prisma.prontuarios.findMany({
      where: {
        clinic_id: clinicId,
        patient_id: patientId,
      },
      orderBy: { created_at: "desc" },
    });
  }

  async createAssinatura(data: Record<string, unknown>) {
    return prisma.pep_assinaturas.create({ data: data as any });
  }

  // Odontogramas
  async findOdontogramaByPatient(patientId: string, clinicId: string) {
    return prisma.odontogramas.findFirst({
      where: { patient_id: patientId, clinic_id: clinicId } as any,
      orderBy: { updated_at: "desc" },
    });
  }

  async findOdontogramaById(id: string, clinicId: string) {
    return prisma.odontogramas.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async findOdontogramaByPatientAndClinic(patientId: string, clinicId: string) {
    return prisma.odontogramas.findFirst({
      where: { patient_id: patientId, clinic_id: clinicId } as any,
    });
  }

  async createOdontograma(data: Record<string, unknown>) {
    return prisma.odontogramas.create({ data: data as any });
  }

  async updateOdontograma(id: string, data: Record<string, unknown>) {
    return prisma.odontogramas.update({
      where: { id },
      data: data as any,
    });
  }

  async deleteOdontograma(id: string) {
    await prisma.odontogramas.delete({ where: { id } });
  }

  // Odontograma history
  async findOdontogramaHistory(where: Record<string, unknown>) {
    return prisma.pep_odontograma_history.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 100,
    });
  }

  async createOdontogramaHistory(data: Record<string, unknown>) {
    return prisma.pep_odontograma_history.create({ data: data as any });
  }

  // Prontuarios
  async findProntuarioByIdAndClinic(id: string, clinicId: string) {
    return prisma.prontuarios.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateProntuario(id: string, data: Record<string, unknown>) {
    return prisma.prontuarios.update({
      where: { id },
      data: data as any,
    });
  }

  async deleteProntuario(id: string) {
    await prisma.prontuarios.delete({ where: { id } });
  }

  // Anexos
  async createAnexo(data: Record<string, unknown>) {
    return prisma.pep_anexos.create({ data: data as any });
  }

  async updateAnexo(id: string, data: Record<string, unknown>) {
    return prisma.pep_anexos.update({
      where: { id },
      data: data as any,
    });
  }

  async deleteAnexo(id: string) {
    await prisma.pep_anexos.delete({ where: { id } });
  }

  // Evolucoes
  async createEvolucao(data: Record<string, unknown>) {
    return prisma.pep_evolucoes.create({ data: data as any });
  }

  async updateEvolucao(id: string, data: Record<string, unknown>) {
    return prisma.pep_evolucoes.update({
      where: { id },
      data: data as any,
    });
  }

  async deleteEvolucao(id: string) {
    await prisma.pep_evolucoes.delete({ where: { id } });
  }

  // Tratamentos
  async findManyTratamentos(where: Record<string, unknown>) {
    return prisma.pep_tratamentos.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async findTratamentoById(id: string) {
    return prisma.pep_tratamentos.findFirst({
      where: { id },
    });
  }

  async createTratamento(data: Record<string, unknown>) {
    return prisma.pep_tratamentos.create({ data: data as any });
  }

  async updateTratamento(id: string, data: Record<string, unknown>) {
    return prisma.pep_tratamentos.update({
      where: { id },
      data: data as any,
    });
  }

  async deleteTratamento(id: string) {
    await prisma.pep_tratamentos.delete({ where: { id } });
  }

  // Odontograma data
  async findOdontogramaDataByTooth(prontuarioId: string, toothNumber: number) {
    return prisma.pep_odontograma_data.findFirst({
      where: { prontuario_id: prontuarioId, tooth_number: toothNumber },
    });
  }

  async createOdontogramaData(data: Record<string, unknown>) {
    return prisma.pep_odontograma_data.create({ data: data as any });
  }

  async updateOdontogramaData(id: string, data: Record<string, unknown>) {
    return prisma.pep_odontograma_data.update({
      where: { id },
      data: data as any,
    });
  }

  async deleteOdontogramaData(id: string) {
    await prisma.pep_odontograma_data.delete({ where: { id } });
  }

  // Tooth surfaces
  async findToothSurfaceByOdontogramaDataAndSurface(
    odontogramaDataId: string,
    surface: string,
  ) {
    return prisma.pep_tooth_surfaces.findFirst({
      where: { odontograma_data_id: odontogramaDataId, surface },
    });
  }

  async createToothSurface(data: Record<string, unknown>) {
    return prisma.pep_tooth_surfaces.create({ data: data as any });
  }

  async updateToothSurface(id: string, data: Record<string, unknown>) {
    return prisma.pep_tooth_surfaces.update({
      where: { id },
      data: data as any,
    });
  }
}
