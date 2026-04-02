import { Modulo } from '../entities/Modulo';

export interface IModuloRepository {
  findByModuleKey(moduleKey: string, clinicId: string): Promise<Modulo | null>;
  findAll(options: { clinicId: string; categoria?: string; onlyActive?: boolean }): Promise<{ items: Modulo[]; total: number }>;
  save(modulo: Modulo): Promise<void>;
  update(modulo: Modulo): Promise<void>;
}
