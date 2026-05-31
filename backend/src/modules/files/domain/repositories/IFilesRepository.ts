// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FileRepositoryResult = any;

export interface IFilesRepository {
  // ── Arquivo ───────────────────────────────────────────────────────────
  createArquivo(data: Record<string, unknown>): Promise<FileRepositoryResult>;
  findArquivos(where: Record<string, unknown>, orderBy?: Record<string, unknown>, take?: number): Promise<FileRepositoryResult[]>;
  findArquivoById(id: string, clinicId: string): Promise<FileRepositoryResult | null>;
  deleteArquivo(id: string, clinicId: string): Promise<FileRepositoryResult>;
  updateArquivoUrlTemp(
    id: string,
    clinicId: string,
    urlTemp: string,
    expiraEm: Date,
  ): Promise<FileRepositoryResult>;
  updateArquivoOcrStatus(
    id: string,
    clinicId: string,
    status: string,
  ): Promise<FileRepositoryResult>;
  updateArquivoVersaoAtual(
    id: string,
    clinicId: string,
    versaoAtualId: string,
  ): Promise<FileRepositoryResult>;
  updateArquivoFromVersion(
    id: string,
    clinicId: string,
    versionData: {
      nome_storage: string;
      tamanho_bytes: number;
      versao_atual_id: string;
    },
  ): Promise<FileRepositoryResult>;

  // ── Arquivo OCR ───────────────────────────────────────────────────────
  createOCR(data: Record<string, unknown>): Promise<FileRepositoryResult>;
  findOCRByArquivoId(arquivoId: string): Promise<FileRepositoryResult | null>;
  findOCRsByText(searchTerm: string): Promise<FileRepositoryResult[]>;

  // ── Arquivo Versao ────────────────────────────────────────────────────
  findLastVersion(arquivoId: string): Promise<FileRepositoryResult | null>;
  createVersion(data: Record<string, unknown>): Promise<FileRepositoryResult>;
  findVersionsByArquivoId(arquivoId: string): Promise<FileRepositoryResult[]>;
  findVersionById(id: string, arquivoId: string): Promise<FileRepositoryResult | null>;

  // ── Patients ──────────────────────────────────────────────────────────
  findPatientById(id: string, clinicId: string): Promise<FileRepositoryResult | null>;

  // ── Audit Logs / Backup ───────────────────────────────────────────────
  createAuditLog(data: Record<string, unknown>): Promise<FileRepositoryResult>;
  findBackupById(id: string): Promise<FileRepositoryResult | null>;
  updateBackup(id: string, clinicId: string, data: Record<string, unknown>): Promise<FileRepositoryResult>;
}
