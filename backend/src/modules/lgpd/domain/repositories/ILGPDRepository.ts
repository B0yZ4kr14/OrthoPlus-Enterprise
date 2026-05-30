export interface ILGPDRepository {
  findManyConsentimentos(where: Record<string, unknown>): Promise<unknown[]>;
  createConsentimento(data: Record<string, unknown>): Promise<unknown>;

  findManySolicitacoes(where: Record<string, unknown>): Promise<unknown[]>;
  createSolicitacao(data: Record<string, unknown>): Promise<unknown>;
  findSolicitacaoById(id: string, clinicId: string): Promise<unknown | null>;
  updateSolicitacao(
    id: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
}
