import { logger } from '@/infrastructure/logger';
import { IPatientRepository } from '../../domain/repositories/IPatientRepository';
import { Patient } from '../../domain/entities/Patient';

export interface UpdatePatientDTO {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  mobile?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  notes?: string;
  clinicId: string;
  updatedBy: string;
}

export class UpdatePatientCommand {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(data: UpdatePatientDTO): Promise<Patient> {
    try {
      logger.info('Updating patient', { patientId: data.id });

      const patient = await this.patientRepository.findById(data.id, data.clinicId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      patient.atualizarDadosPessoais({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        rg: data.rg,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        gender: data.gender,
        mobile: data.mobile,
        addressStreet: data.addressStreet,
        addressNumber: data.addressNumber,
        addressComplement: data.addressComplement,
        addressNeighborhood: data.addressNeighborhood,
        addressCity: data.addressCity,
        addressState: data.addressState,
        addressZipcode: data.addressZipcode,
        notes: data.notes,
      }, data.updatedBy);

      await this.patientRepository.update(patient);

      logger.info('Patient updated successfully', { patientId: data.id });
      return patient;
    } catch (error) {
      logger.error('Error updating patient', { error, patientId: data.id });
      throw error;
    }
  }
}
