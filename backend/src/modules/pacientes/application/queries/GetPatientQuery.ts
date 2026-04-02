import { logger } from '@/infrastructure/logger';
import { IPatientRepository } from '../../domain/repositories/IPatientRepository';
import { Patient } from '../../domain/entities/Patient';

export interface GetPatientDTO {
  id: string;
  clinicId: string;
}

export class GetPatientQuery {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(data: GetPatientDTO): Promise<Patient | null> {
    try {
      logger.debug('Getting patient by id', { patientId: data.id });
      
      const patient = await this.patientRepository.findById(data.id, data.clinicId);
      
      if (patient && patient.clinicId !== data.clinicId) {
        logger.warn('Patient does not belong to clinic', { patientId: data.id, clinicId: data.clinicId });
        return null;
      }
      
      return patient;
    } catch (error) {
      logger.error('Error getting patient', { error, patientId: data.id });
      throw error;
    }
  }
}
