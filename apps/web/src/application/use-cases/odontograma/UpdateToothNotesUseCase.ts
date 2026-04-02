import { Odontograma } from "@/domain/entities/Odontograma";
import { IOdontogramaRepository } from "@/domain/repositories/IOdontogramaRepository";

export interface UpdateToothNotesInput {
  odontogramaId: string;
  toothNumber: number;
  notes: string;
}

export interface UpdateToothNotesOutput {
  odontograma: Odontograma;
}

/**
 * Use Case: Atualizar Notas de Dente
 *
 * Atualiza as notas/observações de um dente específico no odontograma.
 */
export class UpdateToothNotesUseCase {
  constructor(private readonly odontogramaRepository: IOdontogramaRepository) {}

  async execute(input: UpdateToothNotesInput): Promise<UpdateToothNotesOutput> {
    // Validações de input
    if (!input.odontogramaId?.trim()) {
      throw new Error("ID do odontograma é obrigatório");
    }

    if (!input.toothNumber) {
      throw new Error("Número do dente é obrigatório");
    }

    // Buscar odontograma existente
    const odontograma = await this.odontogramaRepository.findById(
      input.odontogramaId,
    );

    if (!odontograma) {
      throw new Error("Odontograma não encontrado");
    }

    // Atualizar notas do dente (validações de domínio são aplicadas pela entidade)
    odontograma.atualizarNotas(input.toothNumber, input.notes);

    // Persistir mudanças
    await this.odontogramaRepository.update(odontograma);

    return { odontograma };
  }
}
