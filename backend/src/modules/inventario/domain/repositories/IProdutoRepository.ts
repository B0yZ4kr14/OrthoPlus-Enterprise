import { Produto } from '../entities/Produto';

export interface FindAllOptions {
  clinicId: string;
  categoria?: string;
  status?: string;
  searchTerm?: string;
  skip?: number;
  take?: number;
}

export interface IProdutoRepository {
  findById(id: string): Promise<Produto | null>;
  findByCodigo(codigo: string, clinicId: string): Promise<Produto | null>;
  findAll(options: FindAllOptions): Promise<{ items: Produto[]; total: number }>;
  findEstoqueBaixo(clinicId: string, limiteMinimo?: number): Promise<Produto[]>;
  save(produto: Produto): Promise<void>;
  update(produto: Produto): Promise<void>;
  delete(id: string): Promise<void>;
  findByClinic(clinicId: string, filters?: { categoriaId?: string; fornecedorId?: string; ativo?: boolean; estoqueBaixo?: boolean; search?: string }): Promise<Produto[]>;
  count(clinicId: string, filters?: { categoriaId?: string; fornecedorId?: string; ativo?: boolean; estoqueBaixo?: boolean; search?: string }): Promise<number>;
}
