import { NFe } from '../entities/NFe';

export interface NFeQueryOptions {
  clinicId: string;
  status?: string;
  tipo?: string;
  clienteId?: string;
  take?: number;
  skip?: number;
}

export interface INFeRepository {
  findById(id: string): Promise<NFe | null>;
  findByNumero(numero: string): Promise<NFe | null>;
  findAll(options: NFeQueryOptions): Promise<{ items: NFe[]; total: number }>;
  save(nfe: NFe): Promise<void>;
  update(nfe: NFe): Promise<void>;
}
