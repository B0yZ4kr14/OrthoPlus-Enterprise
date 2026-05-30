export interface IPepRepository {
  // Odontogramas
  findOdontogramaByPatient(
    patientId: string,
    clinicId: string,
  ): Promise<unknown | null>;
  findOdontogramaById(id: string, clinicId: string): Promise<unknown | null>;
  findOdontogramaByPatientAndClinic(
    patientId: string,
    clinicId: string,
  ): Promise<unknown | null>;
  createOdontograma(data: Record<string, unknown>): Promise<unknown>;
  updateOdontograma(
    id: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
  deleteOdontograma(id: string): Promise<void>;

  // Odontograma history
  findOdontogramaHistory(where: Record<string, unknown>): Promise<unknown[]>;
  createOdontogramaHistory(data: Record<string, unknown>): Promise<unknown>;

  // Prontuarios
  findProntuarioByIdAndClinic(
    id: string,
    clinicId: string,
  ): Promise<unknown | null>;
  updateProntuario(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteProntuario(id: string): Promise<void>;

  // Anexos
  createAnexo(data: Record<string, unknown>): Promise<unknown>;
  updateAnexo(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteAnexo(id: string): Promise<void>;

  // Evolucoes
  createEvolucao(data: Record<string, unknown>): Promise<unknown>;
  updateEvolucao(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteEvolucao(id: string): Promise<void>;

  // Tratamentos
  findManyTratamentos(where: Record<string, unknown>): Promise<unknown[]>;
  findTratamentoById(id: string): Promise<unknown | null>;
  createTratamento(data: Record<string, unknown>): Promise<unknown>;
  updateTratamento(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteTratamento(id: string): Promise<void>;

  // Odontograma data
  findOdontogramaDataByTooth(
    prontuarioId: string,
    toothNumber: number,
  ): Promise<unknown | null>;
  createOdontogramaData(data: Record<string, unknown>): Promise<unknown>;
  updateOdontogramaData(
    id: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
  deleteOdontogramaData(id: string): Promise<void>;

  // Tooth surfaces
  findToothSurfaceByOdontogramaDataAndSurface(
    odontogramaDataId: string,
    surface: string,
  ): Promise<unknown | null>;
  createToothSurface(data: Record<string, unknown>): Promise<unknown>;
  updateToothSurface(
    id: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;

  // Existing methods
  createProntuario(data: Record<string, unknown>): Promise<unknown>;
  findProntuariosByPatientAndClinic(
    patientId: string,
    clinicId: string,
  ): Promise<unknown[]>;
  createAssinatura(data: Record<string, unknown>): Promise<unknown>;
}
