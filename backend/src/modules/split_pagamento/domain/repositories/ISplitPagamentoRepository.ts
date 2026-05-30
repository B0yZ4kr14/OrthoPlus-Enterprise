export interface ISplitPagamentoRepository {
  findManyConfig(clinicId: string): Promise<unknown[]>;
  findConfigByClinic(clinicId: string): Promise<unknown | null>;
  updateConfig(id: string, data: Record<string, unknown>): Promise<unknown>;
  createConfig(data: Record<string, unknown>): Promise<unknown>;

  findManyComissoes(where: Record<string, unknown>): Promise<unknown[]>;
  createComissao(data: Record<string, unknown>): Promise<unknown>;

  findManyTransacoes(where: Record<string, unknown>): Promise<unknown[]>;
  createTransacao(data: Record<string, unknown>): Promise<unknown>;

  findConfigByProfessional(
    clinicId: string,
    professionalId: string,
    procedureType?: string,
  ): Promise<unknown | null>;
}
