import { Orcamento } from "../entities/Orcamento";

/**
 * Interface do repositório de orçamentos
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IOrcamentoRepository {
  /**
   * Busca um orçamento por ID
   */
  findById(id: string): Promise<Orcamento | null>;

  /**
   * Busca orçamento por número
   */
  findByNumero(
    numeroOrcamento: string,
    clinicId: string,
  ): Promise<Orcamento | null>;

  /**
   * Busca orçamentos de um paciente
   */
  findByPatientId(patientId: string, clinicId: string): Promise<Orcamento[]>;

  /**
   * Busca todos os orçamentos de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Orcamento[]>;

  /**
   * Busca orçamentos por status
   */
  findByStatus(
    clinicId: string,
    status: "RASCUNHO" | "PENDENTE" | "APROVADO" | "REJEITADO" | "EXPIRADO",
  ): Promise<Orcamento[]>;

  /**
   * Busca orçamentos pendentes (aguardando aprovação)
   */
  findPendentes(clinicId: string): Promise<Orcamento[]>;

  /**
   * Busca orçamentos expirados ou prestes a expirar
   */
  findExpirados(clinicId: string): Promise<Orcamento[]>;

  /**
   * Salva um novo orçamento
   */
  save(orcamento: Orcamento): Promise<void>;

  /**
   * Atualiza um orçamento existente
   */
  update(orcamento: Orcamento): Promise<void>;

  /**
   * Remove um orçamento
   */
  delete(id: string): Promise<void>;
}
