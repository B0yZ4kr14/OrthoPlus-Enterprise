import { User } from "../entities/User";

/**
 * Interface do repositório de usuários
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IUserRepository {
  /**
   * Busca um usuário por ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca um usuário por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca todos os usuários de uma clínica
   */
  findByClinicId(clinicId: string): Promise<User[]>;

  /**
   * Busca usuários ativos de uma clínica
   */
  findActiveByClinicId(clinicId: string): Promise<User[]>;

  /**
   * Busca administradores de uma clínica
   */
  findAdminsByClinicId(clinicId: string): Promise<User[]>;

  /**
   * Salva um novo usuário
   */
  save(user: User): Promise<void>;

  /**
   * Atualiza um usuário existente
   */
  update(user: User): Promise<void>;

  /**
   * Remove um usuário (soft delete - marca como inativo)
   */
  delete(id: string): Promise<void>;
}
