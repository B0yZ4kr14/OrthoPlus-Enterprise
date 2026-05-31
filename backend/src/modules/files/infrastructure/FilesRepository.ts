import { prisma } from "@/infrastructure/database/prismaClient";
import { IFilesRepository } from "@/modules/files/domain/repositories/IFilesRepository";

export class FilesRepository implements IFilesRepository {
  // ── Arquivo ───────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createArquivo(data: Record<string, unknown>) {
    return prisma.arquivo.create({ data: data as any });
  }

  async findArquivos(
    where: Record<string, unknown>,
    orderBy?: Record<string, unknown>,
    take?: number,
  ) {
    return prisma.arquivo.findMany({ where: where as any, orderBy: orderBy as any, take });
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

  async updateArquivoUrlTemp(
    id: string,
    clinicId: string,
    urlTemp: string,
    expiraEm: Date,
  ) {
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

  async updateArquivoVersaoAtual(
    id: string,
    clinicId: string,
    versaoAtualId: string,
  ) {
    return prisma.arquivo.updateMany({
      where: { id, clinic_id: clinicId },
      data: { versao_atual_id: versaoAtualId },
    });
  }

  async updateArquivoFromVersion(
    id: string,
    clinicId: string,
    versionData: {
      nome_storage: string;
      tamanho_bytes: number;
      versao_atual_id: string;
    },
  ) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createOCR(data: Record<string, unknown>) {
    return prisma.arquivo_ocr.create({ data: data as any });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createVersion(data: Record<string, unknown>) {
    return prisma.arquivo_versao.create({ data: data as any });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAuditLog(data: Record<string, unknown>) {
    return prisma.audit_logs.create({ data: data as any });
  }

  async findBackupById(id: string) {
    return prisma.backup_history.findUnique({ where: { id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateBackup(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.backup_history.updateMany({ where: { id, clinic_id: clinicId }, data: data as any });
  }
}
