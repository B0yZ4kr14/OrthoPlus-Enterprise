import { Patient } from '../domain/entities/Patient';
import { PatientStatus } from '../domain/value-objects/PatientStatus';

describe('Patient Entity', () => {
  it('should create a patient with valid data', () => {
    const patient = Patient.create({
      clinicId: 'clinic-1',
      fullName: 'João Silva',
      cpf: '529.982.247-25',
      email: 'joao@example.com',
      status: PatientStatus.fromCode('PROSPECT'),
      isActive: true,
    });

    expect(patient.fullName).toBe('João Silva');
    expect(patient.statusCode).toBe('PROSPECT');
  });

  it('should change status correctly', () => {
    const patient = Patient.create({
      clinicId: 'clinic-1',
      fullName: 'João Silva',
      cpf: '529.982.247-25',
      email: 'joao@example.com',
      status: PatientStatus.fromCode('PROSPECT'),
      isActive: true,
    });

    patient.changeStatus('TRATAMENTO');
    expect(patient.statusCode).toBe('TRATAMENTO');
  });
});
