import { DentistSchedule } from "../../domain/entities/DentistSchedule";
import { IDentistScheduleRepository } from "../../domain/repositories/IDentistScheduleRepository";

interface ListDentistSchedulesInput {
  clinicId?: string;
  dentistId?: string;
}

export class ListDentistSchedulesUseCase {
  constructor(private scheduleRepository: IDentistScheduleRepository) {}

  async execute(input: ListDentistSchedulesInput): Promise<DentistSchedule[]> {
    if (input.dentistId) {
      return await this.scheduleRepository.findByDentist(input.dentistId);
    }

    if (input.clinicId) {
      return await this.scheduleRepository.findByClinicId(input.clinicId);
    }

    throw new Error("Parâmetros insuficientes para buscar horários");
  }
}
