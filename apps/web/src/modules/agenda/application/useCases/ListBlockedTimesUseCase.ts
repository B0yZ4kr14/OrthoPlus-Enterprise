import { BlockedTime } from "../../domain/entities/BlockedTime";
import { IBlockedTimeRepository } from "../../domain/repositories/IBlockedTimeRepository";

interface ListBlockedTimesInput {
  clinicId?: string;
  dentistId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class ListBlockedTimesUseCase {
  constructor(private blockedTimeRepository: IBlockedTimeRepository) {}

  async execute(input: ListBlockedTimesInput): Promise<BlockedTime[]> {
    if (input.dentistId && input.startDate && input.endDate) {
      return await this.blockedTimeRepository.findByDentistAndDateRange(
        input.dentistId,
        input.startDate,
        input.endDate,
      );
    }

    if (input.dentistId) {
      return await this.blockedTimeRepository.findByDentist(input.dentistId);
    }

    if (input.clinicId) {
      return await this.blockedTimeRepository.findByClinicId(input.clinicId);
    }

    throw new Error("Parâmetros insuficientes para buscar bloqueios");
  }
}
