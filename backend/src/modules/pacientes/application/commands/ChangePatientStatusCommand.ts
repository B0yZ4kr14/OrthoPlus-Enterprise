import { logger } from '@/infrastructure/logger';
import { IPatientRepository } from '../../domain/repositories/IPatientRepository';
import { Patient } from '../../domain/entities/Patient';

export interface ChangePatientStatusDTO {
  patientId: string;
  statusCode: string;
  reason: string;
  clinicId: string;
  changedBy: string;
}

export class ChangePatientStatusCommand {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(data: ChangePatientStatusDTO): Promise<Patient> {
    try {
      logger.info('Changing patient status', { patientId: data.patientId, statusCode: data.statusCode });

      const patient = await this.patientRepository.findById(data.patientId, data.clinicId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      patient.changeStatus(data.statusCode, data.changedBy, data.reason);
      await this.patientRepository.save(patient);

      logger.info('Patient status changed successfully', { patientId: data.patientId });
      return patient;
    } catch (error) {
      logger.error('Error changing patient status', { error, patientId: data.patientId });
      throw error;
    }
  }
}
