import { Odontograma } from "@/domain/entities/Odontograma";
import { IOdontogramaRepository } from "@/domain/repositories/IOdontogramaRepository";
import {
  ToothStatus,
  ToothSurface,
} from "@/modules/pep/types/odontograma.types";

export interface UpdateToothSurfaceInput {
  odontogramaId: string;
  toothNumber: number;
  surface: ToothSurface;
  newStatus: ToothStatus;
}

export interface UpdateToothSurfaceOutput {
  odontograma: Odontograma;
}

/**
 * Use Case: Atualizar Superfície de Dente
 *
 * Atualiza o status de uma superfície específica de um dente
 * (mesial, distal, oclusal, vestibular, lingual).
 * Adiciona automaticamente uma entrada no histórico.
 */
export class UpdateToothSurfaceUseCase {
  constructor(private readonly odontogramaRepository: IOdontogramaRepository) {}

  async execute(
    input: UpdateToothSurfaceInput,
  ): Promise<UpdateToothSurfaceOutput> {
    // Validações de input
    if (!input.odontogramaId?.trim()) {
      throw new Error("ID do odontograma é obrigatório");
    }

    if (!input.toothNumber) {
      throw new Error("Número do dente é obrigatório");
    }

    if (!input.surface) {
      throw new Error("Superfície do dente é obrigatória");
    }

    if (!input.newStatus) {
      throw new Error("Novo status da superfície é obrigatório");
    }

    // Buscar odontograma existente
    const odontograma = await this.odontogramaRepository.findById(
      input.odontogramaId,
    );

    if (!odontograma) {
      throw new Error("Odontograma não encontrado");
    }

    // Atualizar superfície do dente (validações de domínio são aplicadas pela entidade)
    odontograma.atualizarSuperficie(
      input.toothNumber,
      input.surface,
      input.newStatus,
    );

    // Persistir mudanças
    await this.odontogramaRepository.update(odontograma);

    return { odontograma };
  }
}
