/**
 * IReportRepository — interface for relatorios module database access.
 * Decouples ReportControllerService from Prisma / infrastructure details.
 */
export interface IReportRepository {
  findProfileById(id: string): Promise<any>;
  findClinicModules(clinicId: string): Promise<any[]>;
  findModuleCatalogs(ids: number[]): Promise<any[]>;
  findPatientsByClinic(clinicId: string): Promise<any[]>;
  findWikiPageVersions(take?: number): Promise<any[]>;
  findProntuariosByClinic(clinicId: string): Promise<any[]>;
  findAppointmentsOrthoByClinic(clinicId: string): Promise<any[]>;
  findContasReceberByClinic(clinicId: string): Promise<any[]>;
  findContasPagarByClinic(clinicId: string): Promise<any[]>;
  createAuditLog(data: any): Promise<any>;
  findModuleCatalogByKey(moduleKey: string): Promise<any>;
  upsertClinicModule(
    clinicId: string,
    moduleCatalogId: number,
    isActive: boolean,
  ): Promise<any>;
  createProntuario(data: any): Promise<any>;
  createPepOdontograma(data: any): Promise<any>;
}
