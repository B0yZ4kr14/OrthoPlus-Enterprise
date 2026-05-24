import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { Appointment } from '../../domain/entities/Appointment';
import { logger } from '@/infrastructure/logger';
import { EventBus } from '@/shared/events/EventBus';
import { AppointmentCreatedEvent } from '../../domain/events/AppointmentCreatedEvent';
import { agendaMetrics } from '@/infrastructure/metrics/AgendaMetrics';
import { withTiming } from '@/infrastructure/metrics/withTiming';
import { randomUUID } from 'crypto';

export interface CreateAppointmentCommand {
  patientId: string;
  dentistId: string;
  startTime: Date;
  endTime: Date;
  type: 'CONSULTA' | 'RETORNO' | 'EMERGENCIA' | 'AVALIACAO' | 'PROCEDIMENTO';
  notes?: string;
  clinicId: string;
  createdBy: string;
}

export class CreateAppointmentCommandHandler {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<Appointment> {
    return withTiming(
      async () => {
        // Verificar conflitos de horário
        const hasConflict = await this.appointmentRepository.hasTimeConflict(
          command.dentistId,
          command.startTime,
          command.endTime,
          command.clinicId
        );

        if (hasConflict) {
          throw new Error('Conflito de horário detectado');
        }

        const appointment = Appointment.create({
          id: randomUUID(),
          ...command,
          status: 'AGENDADO',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await this.appointmentRepository.save(appointment);
        
        await this.eventBus.publish(new AppointmentCreatedEvent(
          appointment.id,
          appointment.clinicId,
          appointment.patientId
        ));
        
        logger.info('Agendamento criado', { 
          appointmentId: appointment.id,
          patientId: command.patientId,
          dentistId: command.dentistId,
          startTime: command.startTime
        });

        return appointment;
      },
      {
        onSuccess: (durationMs, appointment) => {
          agendaMetrics.observeAppointmentCreateDuration(command.clinicId, appointment.status, durationMs)
          agendaMetrics.incrementAppointmentsTotal(appointment.status, command.clinicId)
        },
        onError: (durationMs, error) => {
          agendaMetrics.observeAppointmentCreateDuration(command.clinicId, 'ERROR', durationMs)
          logger.error('Erro ao criar agendamento', { error, command });
        },
      }
    );
  }
}
