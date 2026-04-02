import { Appointment } from "../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

interface ListAppointmentsInput {
  clinicId?: string;
  dentistId?: string;
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class ListAppointmentsUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: ListAppointmentsInput): Promise<Appointment[]> {
    if (input.dentistId && input.startDate && input.endDate) {
      return await this.appointmentRepository.findByDentistAndDateRange(
        input.dentistId,
        input.startDate,
        input.endDate,
      );
    }

    if (input.clinicId && input.startDate && input.endDate) {
      return await this.appointmentRepository.findByDateRange(
        input.clinicId,
        input.startDate,
        input.endDate,
      );
    }

    if (input.patientId) {
      return await this.appointmentRepository.findByPatient(input.patientId);
    }

    if (input.dentistId) {
      return await this.appointmentRepository.findByDentist(input.dentistId);
    }

    if (input.clinicId) {
      return await this.appointmentRepository.findByClinicId(input.clinicId);
    }

    throw new Error("Parâmetros insuficientes para buscar agendamentos");
  }
}
