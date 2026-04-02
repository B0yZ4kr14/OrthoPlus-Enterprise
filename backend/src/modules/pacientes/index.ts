// Domain exports
export { Patient } from './domain/entities/Patient';
export { IPatientRepository } from './domain/repositories/IPatientRepository';

// Application exports
export { CreatePatientCommand } from './application/commands/CreatePatientCommand';
export { GetPatientQuery } from './application/queries/GetPatientQuery';

// Infrastructure exports
export { PatientRepositoryPostgres } from './infrastructure/repositories/PatientRepositoryPostgres';

// API exports
export { PacientesController } from './api/PacientesController';
