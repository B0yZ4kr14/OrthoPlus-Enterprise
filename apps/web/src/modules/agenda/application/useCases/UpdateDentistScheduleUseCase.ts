import { DentistSchedule } from "../../domain/entities/DentistSchedule";
import { IDentistScheduleRepository } from "../../domain/repositories/IDentistScheduleRepository";

interface UpdateDentistScheduleInput {
  scheduleId: string;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
}

export class UpdateDentistScheduleUseCase {
  constructor(private scheduleRepository: IDentistScheduleRepository) {}

  async execute(input: UpdateDentistScheduleInput): Promise<DentistSchedule> {
    const schedule = await this.scheduleRepository.findById(input.scheduleId);

    if (!schedule) {
      throw new Error("Horário não encontrado");
    }

    if (input.startTime || input.endTime) {
      schedule.updateTimes(
        input.startTime || schedule.startTime,
        input.endTime || schedule.endTime,
        input.breakStart !== undefined ? input.breakStart : schedule.breakStart,
        input.breakEnd !== undefined ? input.breakEnd : schedule.breakEnd,
      );
    }

    return await this.scheduleRepository.update(schedule);
  }
}
