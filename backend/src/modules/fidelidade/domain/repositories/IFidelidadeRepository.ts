export interface IFidelidadeRepository {
  // Pontos
  findPontosByClinic(clinicId: string, patientId?: string): Promise<any[]>;
  createPonto(data: Record<string, unknown>): Promise<any>;
  upsertPacienteFidelidade(
    clinicId: string,
    patientId: string,
    pontos: number,
  ): Promise<any>;
  findBadgesByClinic(clinicId: string): Promise<any[]>;
  findPacienteFidelidade(
    clinicId: string,
    patientId: string,
  ): Promise<any | null>;
  addPointsTransaction(
    clinicId: string,
    patientId: string,
    pontos: number,
    pontoData: Record<string, unknown>,
  ): Promise<[any, any, any[]]>;

  // Badges
  findAllBadgesByClinic(clinicId: string): Promise<any[]>;
  createBadge(data: Record<string, unknown>): Promise<any>;

  // Recompensas
  findRecompensasByClinic(clinicId: string, ativo?: boolean): Promise<any[]>;
  createRecompensa(data: Record<string, unknown>): Promise<any>;

  // Indicacoes
  findIndicacoesByClinic(clinicId: string, referrerId?: string): Promise<any[]>;
  createIndicacao(data: Record<string, unknown>): Promise<any>;
}
