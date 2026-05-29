export interface IFidelidadeRepository {
  // Pontos
  findPontosByClinic(clinicId: string, patientId?: string): Promise<any[]>;
  createPonto(data: any): Promise<any>;
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
    pontoData: any,
  ): Promise<[any, any, any[]]>;

  // Badges
  findAllBadgesByClinic(clinicId: string): Promise<any[]>;
  createBadge(data: any): Promise<any>;

  // Recompensas
  findRecompensasByClinic(clinicId: string, ativo?: boolean): Promise<any[]>;
  createRecompensa(data: any): Promise<any>;

  // Indicacoes
  findIndicacoesByClinic(clinicId: string, referrerId?: string): Promise<any[]>;
  createIndicacao(data: any): Promise<any>;
}
