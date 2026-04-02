import { Modulo } from '../entities/Modulo';

export interface IModuloRepository {
  findById(id: string): Promise<Modulo | null>;
  findAll(options: { status?: string; categoria?: string; skip?: number; take?: number }): Promise<{ items: Modulo[]; total: number }>;
  save(modulo: Modulo): Promise<void>;
}
