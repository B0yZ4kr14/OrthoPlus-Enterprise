export interface IProcedimentosRepository {
  // Templates
  findManyTemplates(where: Record<string, unknown>): Promise<unknown[]>;
  findTemplateById(id: string, clinicId: string): Promise<unknown | null>;
  createTemplate(data: Record<string, unknown>): Promise<unknown>;
  updateTemplate(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteTemplate(id: string, clinicId: string): Promise<void>;

  // Tabelas
  findManyTabelas(clinicId: string): Promise<unknown[]>;
  findTabelaById(id: string, clinicId: string): Promise<unknown | null>;
  createTabela(data: Record<string, unknown>): Promise<unknown>;
  updateTabela(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteTabela(id: string, clinicId: string): Promise<void>;
  updateManyTabelas(
    where: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<unknown>;

  // Precos
  findManyPrecos(where: Record<string, unknown>): Promise<unknown[]>;
  createPreco(data: Record<string, unknown>): Promise<unknown>;
  findPrecoById(id: string, clinicId: string): Promise<unknown | null>;
  updatePreco(id: string, data: Record<string, unknown>): Promise<unknown>;
  deletePreco(id: string, clinicId: string): Promise<void>;
  reajustarPrecos(
    fator: number,
    tabelaPrecoId: string,
    clinicId: string,
  ): Promise<void>;

  // Dentista-Procedimentos
  findManyDentistaProcs(where: Record<string, unknown>): Promise<unknown[]>;
  createDentistaProc(data: Record<string, unknown>): Promise<unknown>;
  findDentistaProcById(id: string, clinicId: string): Promise<unknown | null>;
  updateDentistaProc(
    id: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
  deleteDentistaProc(id: string, clinicId: string): Promise<void>;
}
