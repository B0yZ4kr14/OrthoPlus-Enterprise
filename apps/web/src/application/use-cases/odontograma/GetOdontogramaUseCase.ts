import { Odontograma } from "@/domain/entities/Odontograma";
import { IOdontogramaRepository } from "@/domain/repositories/IOdontogramaRepository";

export interface GetOdontogramaInput {
  prontuarioId: string;
}

export interface GetOdontogramaOutput {
  odontograma: Odontograma;
}

/**
 * Use Case: Buscar Odontograma
 *
 * Busca o odontograma de um prontuário específico.
 * Se não existir, cria um novo odontograma com todos os dentes no status inicial "hígido".
 */
export class GetOdontogramaUseCase {
  constructor(private readonly odontogramaRepository: IOdontogramaRepository) {}

  async execute(input: GetOdontogramaInput): Promise<GetOdontogramaOutput> {
    // Validações de input
    if (!input.prontuarioId?.trim()) {
      throw new Error("ID do prontuário é obrigatório");
    }

    // Buscar odontograma existente
    let odontograma = await this.odontogramaRepository.findByProntuarioId(
      input.prontuarioId,
    );

    // Se não existir, criar um novo
    if (!odontograma) {
      odontograma = Odontograma.create({
        prontuarioId: input.prontuarioId,
      });

      // Persistir o novo odontograma
      await this.odontogramaRepository.save(odontograma);
    }

    return { odontograma };
  }
}
