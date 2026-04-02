import {
  BlockedTime,
  BlockedTimeProps,
} from "../../domain/entities/BlockedTime";
import { IBlockedTimeRepository } from "../../domain/repositories/IBlockedTimeRepository";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

interface CreateBlockedTimeInput {
  clinicId: string;
  dentistId: string;
  startDatetime: Date;
  endDatetime: Date;
  reason: string;
  createdBy: string;
}

export class CreateBlockedTimeUseCase {
  constructor(
    private blockedTimeRepository: IBlockedTimeRepository,
    private appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(input: CreateBlockedTimeInput): Promise<BlockedTime> {
    // Verificar se há agendamentos no período
    const appointments =
      await this.appointmentRepository.findByDentistAndDateRange(
        input.dentistId,
        input.startDatetime,
        input.endDatetime,
      );

    if (appointments.length > 0) {
      throw new Error(
        `Existem ${appointments.length} agendamento(s) neste período. Cancele-os antes de bloquear.`,
      );
    }

    const blockedTimeProps: BlockedTimeProps = {
      id: crypto.randomUUID(),
      clinicId: input.clinicId,
      dentistId: input.dentistId,
      startDatetime: input.startDatetime,
      endDatetime: input.endDatetime,
      reason: input.reason,
      createdBy: input.createdBy,
      createdAt: new Date(),
    };

    const blockedTime = new BlockedTime(blockedTimeProps);

    return await this.blockedTimeRepository.save(blockedTime);
  }
}
