import {
  Appointment,
  AppointmentProps,
} from "../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { IBlockedTimeRepository } from "../../domain/repositories/IBlockedTimeRepository";

interface CreateAppointmentInput {
  clinicId: string;
  patientId: string;
  dentistId: string;
  scheduledDatetime: Date;
  durationMinutes: number;
  appointmentType: string;
  notes?: string;
  createdBy: string;
}

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private blockedTimeRepository: IBlockedTimeRepository,
  ) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    // Verificar se o horário está bloqueado
    const blockedTimes =
      await this.blockedTimeRepository.findByDentistAndDateRange(
        input.dentistId,
        input.scheduledDatetime,
        new Date(
          input.scheduledDatetime.getTime() + input.durationMinutes * 60000,
        ),
      );

    if (blockedTimes.length > 0) {
      throw new Error("Horário bloqueado para este dentista");
    }

    // Verificar conflitos de agendamento
    const endDatetime = new Date(
      input.scheduledDatetime.getTime() + input.durationMinutes * 60000,
    );
    const conflicts = await this.appointmentRepository.findConflicts(
      input.dentistId,
      input.scheduledDatetime,
      endDatetime,
    );

    if (conflicts.length > 0) {
      throw new Error("Já existe um agendamento neste horário");
    }

    // Criar a entidade
    const appointmentProps: AppointmentProps = {
      id: crypto.randomUUID(),
      clinicId: input.clinicId,
      patientId: input.patientId,
      dentistId: input.dentistId,
      scheduledDatetime: input.scheduledDatetime,
      durationMinutes: input.durationMinutes,
      status: "AGENDADO",
      appointmentType: input.appointmentType as unknown,
      notes: input.notes,
      noShow: false,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const appointment = new Appointment(appointmentProps);

    // Persistir
    return await this.appointmentRepository.save(appointment);
  }
}
