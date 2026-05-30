import { prisma } from "@/infrastructure/database/prismaClient";
import {
  IFuncionarioRepository,
  CreateFuncionarioData,
  UpdateFuncionarioData,
} from "../domain/repositories/IFuncionarioRepository";

export class FuncionarioRepository implements IFuncionarioRepository {
  async findManyByClinic(clinicId: string) {
    return prisma.funcionarios.findMany({
      where: { clinic_id: clinicId },
      orderBy: { nome: "asc" },
    });
  }

  async findById(id: string, clinicId: string) {
    return prisma.funcionarios.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async create(data: CreateFuncionarioData & { clinic_id: string }) {
    return prisma.funcionarios.create({ data: data as any });
  }

  async update(id: string, data: UpdateFuncionarioData) {
    return prisma.funcionarios.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string) {
    await prisma.funcionarios.delete({ where: { id } });
  }
}
