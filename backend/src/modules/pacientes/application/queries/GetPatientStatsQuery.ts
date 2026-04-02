import { logger } from '@/infrastructure/logger';
import { IPatientRepository } from '../../domain/repositories/IPatientRepository';

export interface PatientStatsDTO {
  clinicId: string;
}

export interface PatientStatsResult {
  total: number;
  ativos: number;
  inativos: number;
  arquivados: number;
  novosEsteMes: number;
}

export class GetPatientStatsQuery {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(data: PatientStatsDTO): Promise<PatientStatsResult> {
    try {
      logger.debug('Getting patient stats', { clinicId: data.clinicId });
      
      const stats = await this.patientRepository.getStats(data.clinicId);
      
      return stats;
    } catch (error) {
      logger.error('Error getting patient stats', { error, clinicId: data.clinicId });
      throw error;
    }
  }
}
