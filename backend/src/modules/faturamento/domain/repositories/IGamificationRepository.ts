export interface IGamificationRepository {
  findAllClinics(): Promise<any[]>;
  findActiveMetas(clinicId: string): Promise<any[]>;
  findVendasByVendedor(
    clinicId: string,
    vendedorId: string,
    periodoInicio: Date,
    periodoFim: Date,
  ): Promise<any[]>;
  updateMeta(id: string, data: Record<string, unknown>): Promise<any>;
  findPremiacao(
    clinicId: string,
    percentualAtingido: number,
  ): Promise<any | null>;
  findVendasForRanking(clinicId: string, dataInicio: Date): Promise<any[]>;
  findRankingEntry(
    clinicId: string,
    vendedorId: string,
    periodo: string,
    dataReferencia: string,
  ): Promise<any | null>;
  updateRanking(id: string, data: Record<string, unknown>): Promise<any>;
  createRanking(data: Record<string, unknown>): Promise<any>;
  createAuditLog(data: Record<string, unknown>): Promise<any>;
}
