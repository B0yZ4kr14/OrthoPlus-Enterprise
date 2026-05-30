export interface CreateFuncionarioData {
  nome: string;
  cargo?: string;
  email?: string;
  telefone?: string;
  salario?: number;
  data_admissao?: Date | string;
  ativo?: boolean;
}

export interface UpdateFuncionarioData {
  nome?: string;
  cargo?: string;
  email?: string;
  telefone?: string;
  salario?: number;
  data_admissao?: Date | string;
  ativo?: boolean;
}

export interface IFuncionarioRepository {
  findManyByClinic(clinicId: string): Promise<unknown[]>;
  findById(id: string, clinicId: string): Promise<unknown | null>;
  create(data: CreateFuncionarioData & { clinic_id: string }): Promise<unknown>;
  update(id: string, data: UpdateFuncionarioData): Promise<unknown>;
  delete(id: string): Promise<void>;
}
