import { Contrato } from '../entities/Contrato';

export interface IContratoRepository {
  findById(id: string): Promise<Contrato | null>;
  findAll(options: { clinicId: string; pacienteId?: string; status?: string; startDate?: Date; endDate?: Date; skip?: number; take?: number }): Promise<{ items: Contrato[]; total: number }>;
  save(contrato: Contrato): Promise<void>;
  update(contrato: Contrato): Promise<void>;
}
