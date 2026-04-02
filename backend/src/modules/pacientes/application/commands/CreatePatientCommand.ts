import { logger } from '@/infrastructure/logger';
import { IPatientRepository } from '../../domain/repositories/IPatientRepository';
import { Patient } from '../../domain/entities/Patient';
import { PatientStatus } from '../../domain/value-objects/PatientStatus';

export interface CreatePatientDTO {
  fullName: string;
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
  statusCode?: string;
  notes?: string;
  clinicId: string;
  createdBy: string;
}

export class CreatePatientCommand {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(data: CreatePatientDTO): Promise<Patient> {
    try {
      logger.info('Creating patient', { fullName: data.fullName });
      
      const patient = Patient.create({
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
        clinicId: data.clinicId,
        createdBy: data.createdBy,
        // Default status for new patients
        status: data.statusCode ? PatientStatus.fromCode(data.statusCode) : PatientStatus.prospect(),
        isActive: true,
      });

      await this.patientRepository.save(patient);
      
      logger.info('Patient created successfully', { patientId: patient.id });
      return patient;
    } catch (error) {
      logger.error('Error creating patient', { error, fullName: data.fullName });
      throw error;
    }
  }
}
