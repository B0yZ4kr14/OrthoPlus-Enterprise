import { Appointment } from "../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

interface ConfirmAppointmentInput {
  appointmentId: string;
}

export class ConfirmAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: ConfirmAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(
      input.appointmentId,
    );

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    if (!appointment.canBeConfirmed) {
      throw new Error("Este agendamento não pode ser confirmado");
    }

    appointment.confirm();

    return await this.appointmentRepository.update(appointment);
  }
}
