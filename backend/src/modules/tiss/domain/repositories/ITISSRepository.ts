export interface ITISSRepository {
  // Guias
  findManyGuias(
    where: Record<string, unknown>,
    orderBy?: Record<string, unknown>,
    take?: number,
  ): Promise<unknown[]>;
  findGuiaById(id: string, clinicId: string): Promise<unknown | null>;
  createGuia(data: Record<string, unknown>): Promise<unknown>;
  updateGuia(id: string, clinicId: string, data: Record<string, unknown>): Promise<unknown>;
  deleteGuia(id: string, clinicId: string): Promise<void>;
  updateManyGuias(
    where: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<number>;
  groupByGuias(args: Record<string, unknown>): Promise<unknown[]>;
  aggregateGuias(args: Record<string, unknown>): Promise<unknown>;

  // Lotes
  findManyLotes(where: Record<string, unknown>): Promise<unknown[]>;
  findLoteById(id: string, clinicId: string): Promise<unknown | null>;
  createLote(data: Record<string, unknown>): Promise<unknown>;
  updateLote(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteLote(id: string, clinicId: string): Promise<void>;
  countGuiasInLote(loteId: string, clinicId: string): Promise<number>;

  // Batches
  findManyBatches(where: Record<string, unknown>): Promise<unknown[]>;
  findBatchById(id: string, clinicId: string): Promise<unknown | null>;
  createBatch(data: Record<string, unknown>): Promise<unknown>;
  updateBatch(id: string, clinicId: string, data: Record<string, unknown>): Promise<unknown>;
  groupByBatches(args: Record<string, unknown>): Promise<unknown[]>;

  // Convenios
  findManyConvenios(clinicId: string): Promise<unknown[]>;
  findConvenioById(id: string, clinicId: string): Promise<unknown | null>;
  createConvenio(data: Record<string, unknown>): Promise<unknown>;
  updateConvenio(id: string, clinicId: string, data: Record<string, unknown>): Promise<unknown>;
  deleteConvenio(id: string, clinicId: string): Promise<void>;

  // Paciente Convenios
  findManyPacienteConvenios(where: Record<string, unknown>): Promise<unknown[]>;
  findPacienteConvenioById(
    id: string,
    clinicId: string,
  ): Promise<unknown | null>;
  createPacienteConvenio(data: Record<string, unknown>): Promise<unknown>;
  updatePacienteConvenio(
    id: string,
    clinicId: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
  deletePacienteConvenio(id: string, clinicId: string): Promise<void>;
}
