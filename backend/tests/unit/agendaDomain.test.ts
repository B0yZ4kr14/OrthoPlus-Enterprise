import { Appointment } from '../../src/modules/agenda/domain/entities/Appointment';

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment => {
  const now = new Date('2026-03-30T10:00:00Z');
  const endTime = new Date('2026-03-30T11:00:00Z');

  return Appointment.create({
    id: 'appointment-001',
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    dentistId: 'dentist-1',
    startTime: now,
    endTime: endTime,
    status: 'AGENDADO',
    type: 'CONSULTA',
    notes: 'Consulta de rotina',
    createdBy: 'user-1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};

describe('Appointment Domain Entity', () => {
  describe('create', () => {
    it('creates an appointment with the given values', () => {
      const apt = makeAppointment();

      expect(apt.id).toBe('appointment-001');
      expect(apt.clinicId).toBe('clinic-1');
      expect(apt.patientId).toBe('patient-1');
      expect(apt.dentistId).toBe('dentist-1');
      expect(apt.status).toBe('AGENDADO');
      expect(apt.type).toBe('CONSULTA');
      expect(apt.notes).toBe('Consulta de rotina');
    });

    it('supports all appointment types', () => {
      const types: Array<'CONSULTA' | 'RETORNO' | 'EMERGENCIA' | 'PROCEDIMENTO'> = [
        'CONSULTA',
        'RETORNO',
        'EMERGENCIA',
        'PROCEDIMENTO',
      ];

      types.forEach((type) => {
        const apt = makeAppointment({ type });
        expect(apt.type).toBe(type);
      });
    });

    it('allows undefined notes', () => {
      const apt = makeAppointment({ notes: undefined });
      expect(apt.notes).toBeUndefined();
    });

    it('preserves start and end times', () => {
      const start = new Date('2026-04-01T09:00:00Z');
      const end = new Date('2026-04-01T10:30:00Z');

      const apt = makeAppointment({ startTime: start, endTime: end });

      expect(apt.startTime).toEqual(start);
      expect(apt.endTime).toEqual(end);
    });
  });

  describe('start', () => {
    it('changes status to EM_ANDAMENTO', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.start();
      expect(apt.status).toBe('EM_ANDAMENTO');
    });

    it('can start from CONFIRMADO status', () => {
      const apt = makeAppointment({ status: 'CONFIRMADO' });
      apt.start();
      expect(apt.status).toBe('EM_ANDAMENTO');
    });

    it('can be called multiple times (idempotent)', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.start();
      apt.start();
      expect(apt.status).toBe('EM_ANDAMENTO');
    });
  });

  describe('confirm', () => {
    it('changes status to CONFIRMADO', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.confirm();
      expect(apt.status).toBe('CONFIRMADO');
    });

    it('can be called multiple times (idempotent)', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.confirm();
      apt.confirm();
      expect(apt.status).toBe('CONFIRMADO');
    });

    it('can confirm from any status', () => {
      const apt = makeAppointment({ status: 'EM_ANDAMENTO' });
      apt.confirm();
      expect(apt.status).toBe('CONFIRMADO');
    });
  });

  describe('complete', () => {
    it('changes status to CONCLUIDO', () => {
      const apt = makeAppointment({ status: 'EM_ANDAMENTO' });
      apt.complete();
      expect(apt.status).toBe('CONCLUIDO');
    });

    it('can complete from AGENDADO status', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.complete();
      expect(apt.status).toBe('CONCLUIDO');
    });

    it('can be called multiple times (idempotent)', () => {
      const apt = makeAppointment({ status: 'EM_ANDAMENTO' });
      apt.complete();
      apt.complete();
      expect(apt.status).toBe('CONCLUIDO');
    });
  });

  describe('cancel', () => {
    it('changes status to CANCELADO', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.cancel();
      expect(apt.status).toBe('CANCELADO');
    });

    it('can cancel from CONFIRMADO status', () => {
      const apt = makeAppointment({ status: 'CONFIRMADO' });
      apt.cancel();
      expect(apt.status).toBe('CANCELADO');
    });

    it('can cancel from EM_ANDAMENTO status', () => {
      const apt = makeAppointment({ status: 'EM_ANDAMENTO' });
      apt.cancel();
      expect(apt.status).toBe('CANCELADO');
    });

    it('can be called multiple times (idempotent)', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.cancel();
      apt.cancel();
      expect(apt.status).toBe('CANCELADO');
    });
  });

  describe('markNoShow', () => {
    it('changes status to NAO_COMPARECEU', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.markNoShow();
      expect(apt.status).toBe('NAO_COMPARECEU');
    });

    it('can mark no-show from CONFIRMADO status', () => {
      const apt = makeAppointment({ status: 'CONFIRMADO' });
      apt.markNoShow();
      expect(apt.status).toBe('NAO_COMPARECEU');
    });

    it('can be called multiple times (idempotent)', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });
      apt.markNoShow();
      apt.markNoShow();
      expect(apt.status).toBe('NAO_COMPARECEU');
    });
  });

  describe('workflow scenarios', () => {
    it('supports standard appointment workflow: schedule -> confirm -> start -> complete', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });

      // Patient confirms
      apt.confirm();
      expect(apt.status).toBe('CONFIRMADO');

      // Appointment starts
      apt.start();
      expect(apt.status).toBe('EM_ANDAMENTO');

      // Appointment completes
      apt.complete();
      expect(apt.status).toBe('CONCLUIDO');
    });

    it('supports quick workflow: schedule -> start -> complete', () => {
      const apt = makeAppointment({ status: 'AGENDADO' });

      apt.start();
      expect(apt.status).toBe('EM_ANDAMENTO');

      apt.complete();
      expect(apt.status).toBe('CONCLUIDO');
    });

    it('supports emergency workflow: schedule -> complete', () => {
      const apt = makeAppointment({ status: 'AGENDADO', type: 'EMERGENCIA' });

      apt.complete();
      expect(apt.status).toBe('CONCLUIDO');
    });

    it('supports cancellation at any point', () => {
      // Cancel after scheduling
      const apt1 = makeAppointment({ status: 'AGENDADO' });
      apt1.cancel();
      expect(apt1.status).toBe('CANCELADO');

      // Cancel after confirmation
      const apt2 = makeAppointment({ status: 'CONFIRMADO' });
      apt2.cancel();
      expect(apt2.status).toBe('CANCELADO');

      // Cancel during appointment
      const apt3 = makeAppointment({ status: 'EM_ANDAMENTO' });
      apt3.cancel();
      expect(apt3.status).toBe('CANCELADO');
    });

    it('supports no-show marking', () => {
      const apt = makeAppointment({ status: 'CONFIRMADO' });

      // Patient doesn't show up
      apt.markNoShow();
      expect(apt.status).toBe('NAO_COMPARECEU');
    });
  });

  describe('time management', () => {
    it('handles appointment spanning multiple hours', () => {
      const start = new Date('2026-04-01T09:00:00Z');
      const end = new Date('2026-04-01T12:00:00Z');

      const apt = makeAppointment({ startTime: start, endTime: end });

      const duration = apt.endTime.getTime() - apt.startTime.getTime();
      const hours = duration / (1000 * 60 * 60);

      expect(hours).toBe(3);
    });

    it('handles 30-minute appointments', () => {
      const start = new Date('2026-04-01T14:00:00Z');
      const end = new Date('2026-04-01T14:30:00Z');

      const apt = makeAppointment({ startTime: start, endTime: end });

      const duration = apt.endTime.getTime() - apt.startTime.getTime();
      const minutes = duration / (1000 * 60);

      expect(minutes).toBe(30);
    });

    it('handles appointments spanning days (edge case)', () => {
      const start = new Date('2026-04-01T23:00:00Z');
      const end = new Date('2026-04-02T01:00:00Z');

      const apt = makeAppointment({ startTime: start, endTime: end });

      expect(apt.startTime.getDate()).toBe(1);
      expect(apt.endTime.getDate()).toBe(2);
    });
  });

  describe('all status values', () => {
    it('supports all expected status values', () => {
      const statuses = [
        'AGENDADO',
        'CONFIRMADO',
        'EM_ANDAMENTO',
        'CONCLUIDO',
        'CANCELADO',
        'NAO_COMPARECEU',
      ];

      statuses.forEach((status) => {
        const apt = makeAppointment({ status });
        expect(apt.status).toBe(status);
      });
    });
  });
});
