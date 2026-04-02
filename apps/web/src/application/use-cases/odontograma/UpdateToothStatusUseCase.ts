import { Odontograma } from "@/domain/entities/Odontograma";
import { IOdontogramaRepository } from "@/domain/repositories/IOdontogramaRepository";
import { ToothStatus } from "@/modules/pep/types/odontograma.types";

export interface UpdateToothStatusInput {
  odontogramaId: string;
  toothNumber: number;
  newStatus: ToothStatus;
  notes?: string;
}

export interface UpdateToothStatusOutput {
  odontograma: Odontograma;
}

/**
 * Use Case: Atualizar Status de Dente
 *
 * Atualiza o status geral de um dente no odontograma.
 * Adiciona automaticamente uma entrada no histórico.
 */
export class UpdateToothStatusUseCase {
  constructor(private readonly odontogramaRepository: IOdontogramaRepository) {}

  async execute(
    input: UpdateToothStatusInput,
  ): Promise<UpdateToothStatusOutput> {
    // Validações de input
    if (!input.odontogramaId?.trim()) {
      throw new Error("ID do odontograma é obrigatório");
    }

    if (!input.toothNumber) {
      throw new Error("Número do dente é obrigatório");
    }

    if (!input.newStatus) {
      throw new Error("Novo status do dente é obrigatório");
    }

    // Buscar odontograma existente
    const odontograma = await this.odontogramaRepository.findById(
      input.odontogramaId,
    );

    if (!odontograma) {
      throw new Error("Odontograma não encontrado");
    }

    // Atualizar status do dente (validações de domínio são aplicadas pela entidade)
    odontograma.atualizarStatusDente(
      input.toothNumber,
      input.newStatus,
      input.notes,
    );

    // Persistir mudanças
    await this.odontogramaRepository.update(odontograma);

    return { odontograma };
  }
}
