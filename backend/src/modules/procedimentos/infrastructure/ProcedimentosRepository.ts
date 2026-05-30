import { prisma } from "@/infrastructure/database/prismaClient";
import { IProcedimentosRepository } from "../domain/repositories/IProcedimentosRepository";

export class ProcedimentosRepository implements IProcedimentosRepository {
  async findManyTemplates(where: Record<string, unknown>) {
    return prisma.procedimento_templates.findMany({
      where,
      orderBy: { nome: "asc" },
    });
  }

  async findTemplateById(id: string, clinicId: string) {
    return prisma.procedimento_templates.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createTemplate(data: Record<string, unknown>) {
    return prisma.procedimento_templates.create({ data: data as any });
  }

  async updateTemplate(id: string, data: Record<string, unknown>) {
    return prisma.procedimento_templates.update({ where: { id }, data });
  }

  async deleteTemplate(id: string, clinicId: string) {
    await prisma.procedimento_templates.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }

  async findManyTabelas(clinicId: string) {
    return prisma.tabela_precos.findMany({
      where: { clinic_id: clinicId },
      orderBy: { nome: "asc" },
    });
  }

  async findTabelaById(id: string, clinicId: string) {
    return prisma.tabela_precos.findFirst({
      where: { id, clinic_id: clinicId },
      include: { precos: { include: { procedimento_template: true } } },
    });
  }

  async createTabela(data: Record<string, unknown>) {
    return prisma.tabela_precos.create({ data: data as any });
  }

  async updateTabela(id: string, data: Record<string, unknown>) {
    return prisma.tabela_precos.update({ where: { id }, data });
  }

  async deleteTabela(id: string, clinicId: string) {
    await prisma.tabela_precos.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateManyTabelas(
    where: Record<string, unknown>,
    data: Record<string, unknown>,
  ) {
    return prisma.tabela_precos.updateMany({ where, data });
  }

  async findManyPrecos(where: Record<string, unknown>) {
    return prisma.procedimento_precos.findMany({
      where,
      include: { procedimento_template: true, tabela_preco: true },
      orderBy: { created_at: "desc" },
    });
  }

  async createPreco(data: Record<string, unknown>) {
    return prisma.procedimento_precos.create({ data: data as any });
  }

  async findPrecoById(id: string, clinicId: string) {
    return prisma.procedimento_precos.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updatePreco(id: string, data: Record<string, unknown>) {
    return prisma.procedimento_precos.update({ where: { id }, data });
  }

  async deletePreco(id: string, clinicId: string) {
    await prisma.procedimento_precos.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }

  async reajustarPrecos(
    fator: number,
    tabelaPrecoId: string,
    clinicId: string,
  ) {
    await prisma.$queryRaw`
      UPDATE clinico.procedimento_precos
      SET valor = ROUND(valor * ${fator}),
          updated_at = NOW()
      WHERE tabela_preco_id = ${tabelaPrecoId}
        AND clinic_id = ${clinicId}
    `;
  }

  async findManyDentistaProcs(where: Record<string, unknown>) {
    return prisma.dentista_procedimentos.findMany({
      where,
      include: { procedimento_template: true },
      orderBy: { created_at: "desc" },
    });
  }

  async createDentistaProc(data: Record<string, unknown>) {
    return prisma.dentista_procedimentos.create({ data: data as any });
  }

  async findDentistaProcById(id: string, clinicId: string) {
    return prisma.dentista_procedimentos.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateDentistaProc(id: string, data: Record<string, unknown>) {
    return prisma.dentista_procedimentos.update({ where: { id }, data });
  }

  async deleteDentistaProc(id: string, clinicId: string) {
    await prisma.dentista_procedimentos.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }
}
