export interface IInadimplenciaRepository {
  findManyInadimplentes(where: Record<string, unknown>): Promise<unknown[]>;
  findInadimplenteById(id: string, clinicId: string): Promise<unknown | null>;
  updateInadimplente(
    id: string,
    clinicId: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;

  findManyCampanhas(where: Record<string, unknown>): Promise<unknown[]>;
  createCampanha(data: Record<string, unknown>): Promise<unknown>;
  findCampanhaById(id: string, clinicId: string): Promise<unknown | null>;
  updateCampanha(id: string, clinicId: string, data: Record<string, unknown>): Promise<unknown>;
}
