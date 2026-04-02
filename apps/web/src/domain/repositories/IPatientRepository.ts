import { Patient } from "../entities/Patient";

/**
 * Interface do repositório de pacientes
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IPatientRepository {
  /**
   * Busca um paciente por ID
   */
  findById(id: string): Promise<Patient | null>;

  /**
   * Busca todos os pacientes de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Patient[]>;

  /**
   * Busca pacientes ativos de uma clínica
   */
  findActiveByClinicId(clinicId: string): Promise<Patient[]>;

  /**
   * Busca paciente por CPF
   */
  findByCPF(cpf: string, clinicId: string): Promise<Patient | null>;

  /**
   * Salva um novo paciente
   */
  save(patient: Patient): Promise<void>;

  /**
   * Atualiza um paciente existente
   */
  update(patient: Patient): Promise<void>;

  /**
   * Remove um paciente (soft delete - marca como inativo)
   */
  delete(id: string): Promise<void>;

  /**
   * Busca pacientes por nível de risco
   */
  findByRiskLevel(clinicId: string, riskLevel: string): Promise<Patient[]>;
}
