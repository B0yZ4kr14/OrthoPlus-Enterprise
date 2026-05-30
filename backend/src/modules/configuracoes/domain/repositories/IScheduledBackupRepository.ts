export interface IScheduledBackupRepository {
  findMany(clinicId: string): Promise<unknown[]>;
  update(id: string, data: Record<string, unknown>): Promise<unknown>;
  delete(id: string): Promise<void>;
}
