import {
  CreateAppointmentCommand,
  CreateAppointmentCommandHandler,
} from '../../src/modules/agenda/application/commands/CreateAppointmentCommand';
import { IAppointmentRepository } from '../../src/modules/agenda/domain/repositories/IAppointmentRepository';
import { Appointment } from '../../src/modules/agenda/domain/entities/Appointment';
import { EventBus } from '../../src/shared/events/EventBus';

// Mock repository
class MockAppointmentRepository implements IAppointmentRepository {
  private appointments: Map<string, Appointment> = new Map();

  async save(appointment: Appointment): Promise<void> {
    this.appointments.set(appointment.id, appointment);
  }

  async update(appointment: Appointment): Promise<void> {
    this.appointments.set(appointment.id, appointment);
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.get(id) || null;
  }

  async findAll(_options: any): Promise<{ items: Appointment[]; total: number }> {
    const items = Array.from(this.appointments.values());
    return { items, total: items.length };
  }

  async hasTimeConflict(
    dentistId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string,
    excludeId?: string
  ): Promise<boolean> {
    const conflicts = Array.from(this.appointments.values()).filter((apt) => {
      if (apt.dentistId !== dentistId || apt.clinicId !== clinicId) return false;
      if (excludeId && apt.id === excludeId) return false;
      if (apt.status === 'CANCELADO' || apt.status === 'NAO_COMPARECEU') return false;

      // Check for time overlap
      const aptStart = apt.startTime.getTime();
      const aptEnd = apt.endTime.getTime();
      const newStart = startTime.getTime();
      const newEnd = endTime.getTime();

      return (
        (newStart >= aptStart && newStart < aptEnd) || // New starts during existing
        (newEnd > aptStart && newEnd <= aptEnd) || // New ends during existing
        (newStart <= aptStart && newEnd >= aptEnd) // New encompasses existing
      );
    });

    return conflicts.length > 0;
  }

  async delete(id: string): Promise<void> {
    this.appointments.delete(id);
  }

  // Helper for testing
  clear(): void {
    this.appointments.clear();
  }
}

// Mock EventBus
class MockEventBus extends EventBus {
  public events: any[] = [];

  async publish(event: any): Promise<void> {
    this.events.push(event);
  }

  clear(): void {
    this.events = [];
  }
}

describe('CreateAppointmentCommandHandler', () => {
  let repository: MockAppointmentRepository;
  let eventBus: MockEventBus;
  let handler: CreateAppointmentCommandHandler;

  beforeEach(() => {
    repository = new MockAppointmentRepository();
    eventBus = new MockEventBus();
    handler = new CreateAppointmentCommandHandler(repository, eventBus);
  });

  afterEach(() => {
    repository.clear();
    eventBus.clear();
  });

  it('creates a new appointment', async () => {
    const command: CreateAppointmentCommand = {
      patientId: 'patient-1',
      dentistId: 'dentist-1',
      startTime: new Date('2026-04-01T09:00:00Z'),
      endTime: new Date('2026-04-01T10:00:00Z'),
      type: 'CONSULTA',
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const appointment = await handler.execute(command);

    expect(appointment).toBeDefined();
    expect(appointment.patientId).toBe('patient-1');
    expect(appointment.dentistId).toBe('dentist-1');
    expect(appointment.type).toBe('CONSULTA');
    expect(appointment.status).toBe('AGENDADO');
  });

  it('saves appointment to repository', async () => {
    const command: CreateAppointmentCommand = {
      patientId: 'patient-1',
      dentistId: 'dentist-1',
      startTime: new Date('2026-04-01T09:00:00Z'),
      endTime: new Date('2026-04-01T10:00:00Z'),
      type: 'CONSULTA',
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const appointment = await handler.execute(command);
    const saved = await repository.findById(appointment.id);

    expect(saved).toBeDefined();
    expect(saved?.id).toBe(appointment.id);
  });

  it('publishes AppointmentCreatedEvent', async () => {
    const command: CreateAppointmentCommand = {
      patientId: 'patient-1',
      dentistId: 'dentist-1',
      startTime: new Date('2026-04-01T09:00:00Z'),
      endTime: new Date('2026-04-01T10:00:00Z'),
      type: 'CONSULTA',
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    await handler.execute(command);

    expect(eventBus.events).toHaveLength(1);
    expect(eventBus.events[0].eventType).toBe('AppointmentCreated');
  });

  it('includes optional notes', async () => {
    const command: CreateAppointmentCommand = {
      patientId: 'patient-1',
      dentistId: 'dentist-1',
      startTime: new Date('2026-04-01T09:00:00Z'),
      endTime: new Date('2026-04-01T10:00:00Z'),
      type: 'CONSULTA',
      notes: 'Patient requested morning appointment',
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const appointment = await handler.execute(command);

    expect(appointment.notes).toBe('Patient requested morning appointment');
  });

  it('supports all appointment types', async () => {
    const types: Array<'CONSULTA' | 'RETORNO' | 'EMERGENCIA' | 'PROCEDIMENTO'> = [
      'CONSULTA',
      'RETORNO',
      'EMERGENCIA',
      'PROCEDIMENTO',
    ];

    for (const type of types) {
      const command: CreateAppointmentCommand = {
        patientId: 'patient-1',
        dentistId: 'dentist-1',
        startTime: new Date(`2026-04-0${types.indexOf(type) + 1}T09:00:00Z`),
        endTime: new Date(`2026-04-0${types.indexOf(type) + 1}T10:00:00Z`),
        type,
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      const appointment = await handler.execute(command);
      expect(appointment.type).toBe(type);
    }
  });

  it('generates unique ID for each appointment', async () => {
    const command1: CreateAppointmentCommand = {
      patientId: 'patient-1',
      dentistId: 'dentist-1',
      startTime: new Date('2026-04-01T09:00:00Z'),
      endTime: new Date('2026-04-01T10:00:00Z'),
      type: 'CONSULTA',
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const command2: CreateAppointmentCommand = {
      patientId: 'patient-2',
      dentistId: 'dentist-1',
      startTime: new Date('2026-04-01T11:00:00Z'),
      endTime: new Date('2026-04-01T12:00:00Z'),
      type: 'CONSULTA',
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const apt1 = await handler.execute(command1);
    const apt2 = await handler.execute(command2);

    expect(apt1.id).not.toBe(apt2.id);
  });

  describe('time conflict detection', () => {
    it('throws when appointment conflicts with existing time slot', async () => {
      // Create first appointment
      const command1: CreateAppointmentCommand = {
        patientId: 'patient-1',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T09:00:00Z'),
        endTime: new Date('2026-04-01T10:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await handler.execute(command1);

      // Try to create conflicting appointment (same time, same dentist)
      const command2: CreateAppointmentCommand = {
        patientId: 'patient-2',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T09:30:00Z'),
        endTime: new Date('2026-04-01T10:30:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await expect(handler.execute(command2)).rejects.toThrow('Conflito de horário detectado');
    });

    it('allows appointments at different times for same dentist', async () => {
      const command1: CreateAppointmentCommand = {
        patientId: 'patient-1',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T09:00:00Z'),
        endTime: new Date('2026-04-01T10:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await handler.execute(command1);

      const command2: CreateAppointmentCommand = {
        patientId: 'patient-2',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T10:00:00Z'),
        endTime: new Date('2026-04-01T11:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      const apt2 = await handler.execute(command2);
      expect(apt2).toBeDefined();
    });

    it('allows same time for different dentists', async () => {
      const command1: CreateAppointmentCommand = {
        patientId: 'patient-1',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T09:00:00Z'),
        endTime: new Date('2026-04-01T10:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await handler.execute(command1);

      const command2: CreateAppointmentCommand = {
        patientId: 'patient-2',
        dentistId: 'dentist-2',
        startTime: new Date('2026-04-01T09:00:00Z'),
        endTime: new Date('2026-04-01T10:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      const apt2 = await handler.execute(command2);
      expect(apt2).toBeDefined();
    });

    it('detects conflict when new appointment starts during existing', async () => {
      const command1: CreateAppointmentCommand = {
        patientId: 'patient-1',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T09:00:00Z'),
        endTime: new Date('2026-04-01T10:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await handler.execute(command1);

      const command2: CreateAppointmentCommand = {
        patientId: 'patient-2',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T09:30:00Z'),
        endTime: new Date('2026-04-01T11:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await expect(handler.execute(command2)).rejects.toThrow('Conflito de horário detectado');
    });

    it('detects conflict when new appointment ends during existing', async () => {
      const command1: CreateAppointmentCommand = {
        patientId: 'patient-1',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T09:00:00Z'),
        endTime: new Date('2026-04-01T10:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await handler.execute(command1);

      const command2: CreateAppointmentCommand = {
        patientId: 'patient-2',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T08:30:00Z'),
        endTime: new Date('2026-04-01T09:30:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await expect(handler.execute(command2)).rejects.toThrow('Conflito de horário detectado');
    });

    it('detects conflict when new appointment encompasses existing', async () => {
      const command1: CreateAppointmentCommand = {
        patientId: 'patient-1',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T09:00:00Z'),
        endTime: new Date('2026-04-01T10:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await handler.execute(command1);

      const command2: CreateAppointmentCommand = {
        patientId: 'patient-2',
        dentistId: 'dentist-1',
        startTime: new Date('2026-04-01T08:00:00Z'),
        endTime: new Date('2026-04-01T11:00:00Z'),
        type: 'CONSULTA',
        clinicId: 'clinic-1',
        createdBy: 'user-1',
      };

      await expect(handler.execute(command2)).rejects.toThrow('Conflito de horário detectado');
    });
  });
});
