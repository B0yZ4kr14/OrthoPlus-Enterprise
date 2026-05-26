export interface IFilesRepository {
  // ── Arquivo ───────────────────────────────────────────────────────────
  createArquivo(data: any): Promise<any>
  findArquivos(where: any, orderBy?: any, take?: number): Promise<any[]>
  findArquivoById(id: string, clinicId: string): Promise<any | null>
  deleteArquivo(id: string, clinicId: string): Promise<any>
  updateArquivoUrlTemp(id: string, clinicId: string, urlTemp: string, expiraEm: Date): Promise<any>
  updateArquivoOcrStatus(id: string, clinicId: string, status: string): Promise<any>
  updateArquivoVersaoAtual(id: string, clinicId: string, versaoAtualId: string): Promise<any>
  updateArquivoFromVersion(id: string, clinicId: string, versionData: { nome_storage: string; tamanho_bytes: number; versao_atual_id: string }): Promise<any>

  // ── Arquivo OCR ───────────────────────────────────────────────────────
  createOCR(data: any): Promise<any>
  findOCRByArquivoId(arquivoId: string): Promise<any | null>
  findOCRsByText(searchTerm: string): Promise<any[]>

  // ── Arquivo Versao ────────────────────────────────────────────────────
  findLastVersion(arquivoId: string): Promise<any | null>
  createVersion(data: any): Promise<any>
  findVersionsByArquivoId(arquivoId: string): Promise<any[]>
  findVersionById(id: string, arquivoId: string): Promise<any | null>

  // ── Patients ──────────────────────────────────────────────────────────
  findPatientById(id: string, clinicId: string): Promise<any | null>

  // ── Audit Logs / Backup ───────────────────────────────────────────────
  createAuditLog(data: any): Promise<any>
  findBackupById(id: string): Promise<any | null>
  updateBackup(id: string, data: any): Promise<any>
}
