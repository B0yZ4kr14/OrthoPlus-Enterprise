export interface IScheduledBackupRepository {
  findMany(clinicId: string): Promise<unknown[]>;
  update(id: string, clinicId: string, data: Record<string, unknown>): Promise<unknown>;
  delete(id: string, clinicId: string): Promise<void>;
}
