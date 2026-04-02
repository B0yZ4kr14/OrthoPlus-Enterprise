import { Venda } from '../entities/Venda';

export interface FindAllOptions {
  clinicId: string;
  caixaId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

export interface IVendaRepository {
  findById(id: string): Promise<Venda | null>;
  findAll(options: FindAllOptions): Promise<{ items: Venda[]; total: number }>;
  save(venda: Venda): Promise<void>;
  update(venda: Venda): Promise<void>;
}
