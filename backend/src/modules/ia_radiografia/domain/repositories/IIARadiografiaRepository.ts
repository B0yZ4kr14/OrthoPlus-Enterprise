export interface IIARadiografiaRepository {
  // ── Analise ───────────────────────────────────────────────────────────
  createAnalise(data: any): Promise<any>;
  findAnalisesByClinic(clinicId: string): Promise<any[]>;
  findAnaliseById(id: string, clinicId: string): Promise<any | null>;
  findAnaliseByIdOnly(id: string): Promise<any | null>;
  updateAnalise(id: string, data: any): Promise<any>;
  countAnalises(where: any): Promise<number>;
  aggregateConfidence(where: any): Promise<any>;
  aggregateProcessingTime(where: any): Promise<any>;

  // ── Consentimento ─────────────────────────────────────────────────────
  findConsentimento(pacienteId: string, clinicId: string): Promise<any | null>;
  createConsentimento(data: any): Promise<any>;
  findConsentimentoToRevoke(
    pacienteId: string,
    clinicId: string,
  ): Promise<any | null>;
  updateConsentimento(id: string, data: any): Promise<any>;
  findHistoricoConsentimento(
    pacienteId: string,
    clinicId: string,
  ): Promise<any[]>;

  // ── Model Config ──────────────────────────────────────────────────────
  findModelConfigByClinic(clinicId: string): Promise<any | null>;

  // ── Problemas ──────────────────────────────────────────────────────────
  createProblemasRadiograficos(data: any[]): Promise<any>;

  // ── Audit Log ─────────────────────────────────────────────────────────
  createAuditLog(data: any): Promise<any>;
  findAuditLogsByAnalise(analiseId: string): Promise<any[]>;
  findAuditLogsByPaciente(pacienteId: string, clinicId: string): Promise<any[]>;
}
