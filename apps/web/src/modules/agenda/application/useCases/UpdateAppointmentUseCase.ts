import { Appointment } from "../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { IBlockedTimeRepository } from "../../domain/repositories/IBlockedTimeRepository";

interface UpdateAppointmentInput {
  appointmentId: string;
  scheduledDatetime?: Date;
  notes?: string;
}

export class UpdateAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private blockedTimeRepository: IBlockedTimeRepository,
  ) {}

  async execute(input: UpdateAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(
      input.appointmentId,
    );

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    // Se está reagendando
    if (input.scheduledDatetime) {
      const endDatetime = new Date(
        input.scheduledDatetime.getTime() + appointment.durationMinutes * 60000,
      );

      // Verificar bloqueios
      const blockedTimes =
        await this.blockedTimeRepository.findByDentistAndDateRange(
          appointment.dentistId,
          input.scheduledDatetime,
          endDatetime,
        );

      if (blockedTimes.length > 0) {
        throw new Error("Horário bloqueado para este dentista");
      }

      // Verificar conflitos (excluindo o próprio agendamento)
      const conflicts = await this.appointmentRepository.findConflicts(
        appointment.dentistId,
        input.scheduledDatetime,
        endDatetime,
        appointment.id,
      );

      if (conflicts.length > 0) {
        throw new Error("Já existe um agendamento neste horário");
      }

      appointment.reschedule(input.scheduledDatetime);
    }

    if (input.notes !== undefined) {
      appointment.updateNotes(input.notes);
    }

    return await this.appointmentRepository.update(appointment);
  }
}
