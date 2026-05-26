import { prisma } from "@/infrastructure/database/prismaClient";
import { IFilesRepository } from "@/modules/files/domain/repositories/IFilesRepository";

export class FilesRepository implements IFilesRepository {
  // ── Arquivo ───────────────────────────────────────────────────────────

  async createArquivo(data: any) {
    return prisma.arquivo.create({ data });
  }

  async findArquivos(where: any, orderBy?: any, take?: number) {
    return prisma.arquivo.findMany({ where, orderBy, take });
  }

  async findArquivoById(id: string, clinicId: string) {
    return prisma.arquivo.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async deleteArquivo(id: string, clinicId: string) {
    return prisma.arquivo.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateArquivoUrlTemp(id: string, clinicId: string, urlTemp: string, expiraEm: Date) {
    return prisma.arquivo.updateMany({
      where: { id, clinic_id: clinicId },
      data: { url_temp: urlTemp, expira_em: expiraEm },
    });
  }

  async updateArquivoOcrStatus(id: string, clinicId: string, status: string) {
    return prisma.arquivo.updateMany({
      where: { id, clinic_id: clinicId },
      data: { ocr_status: status },
    });
  }

  async updateArquivoVersaoAtual(id: string, clinicId: string, versaoAtualId: string) {
    return prisma.arquivo.updateMany({
      where: { id, clinic_id: clinicId },
      data: { versao_atual_id: versaoAtualId },
    });
  }

  async updateArquivoFromVersion(id: string, clinicId: string, versionData: { nome_storage: string; tamanho_bytes: number; versao_atual_id: string }) {
    return prisma.arquivo.updateMany({
      where: { id, clinic_id: clinicId },
      data: {
        nome_storage: versionData.nome_storage,
        tamanho_bytes: versionData.tamanho_bytes,
        versao_atual_id: versionData.versao_atual_id,
      },
    });
  }

  // ── Arquivo OCR ───────────────────────────────────────────────────────

  async createOCR(data: any) {
    return prisma.arquivo_ocr.create({ data });
  }

  async findOCRByArquivoId(arquivoId: string) {
    return prisma.arquivo_ocr.findFirst({
      where: { arquivo_id: arquivoId },
      orderBy: { created_at: "desc" },
    });
  }

  async findOCRsByText(searchTerm: string) {
    return prisma.arquivo_ocr.findMany({
      where: {
        texto_extraido: { contains: searchTerm, mode: "insensitive" },
      },
      select: { arquivo_id: true },
    });
  }

  // ── Arquivo Versao ────────────────────────────────────────────────────

  async findLastVersion(arquivoId: string) {
    return prisma.arquivo_versao.findFirst({
      where: { arquivo_id: arquivoId },
      orderBy: { numero_versao: "desc" },
    });
  }

  async createVersion(data: any) {
    return prisma.arquivo_versao.create({ data });
  }

  async findVersionsByArquivoId(arquivoId: string) {
    return prisma.arquivo_versao.findMany({
      where: { arquivo_id: arquivoId },
      orderBy: { numero_versao: "desc" },
    });
  }

  async findVersionById(id: string, arquivoId: string) {
    return prisma.arquivo_versao.findFirst({
      where: { id, arquivo_id: arquivoId },
    });
  }

  // ── Patients ──────────────────────────────────────────────────────────

  async findPatientById(id: string, clinicId: string) {
    return prisma.patients.findFirst({
      where: { id, clinic_id: clinicId },
      select: { id: true },
    });
  }

  // ── Audit Logs / Backup ───────────────────────────────────────────────

  async createAuditLog(data: any) {
    return (prisma as any).audit_logs.create({ data });
  }

  async findBackupById(id: string) {
    return prisma.backup_history.findUnique({ where: { id } });
  }

  async updateBackup(id: string, data: any) {
    return prisma.backup_history.update({ where: { id }, data });
  }
}
