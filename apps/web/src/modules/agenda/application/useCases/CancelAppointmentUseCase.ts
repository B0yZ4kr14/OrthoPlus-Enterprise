import { Appointment } from "../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

interface CancelAppointmentInput {
  appointmentId: string;
  reason?: string;
}

export class CancelAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: CancelAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(
      input.appointmentId,
    );

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    if (!appointment.canBeCancelled) {
      throw new Error("Este agendamento não pode ser cancelado");
    }

    appointment.cancel(input.reason);

    return await this.appointmentRepository.update(appointment);
  }
}
