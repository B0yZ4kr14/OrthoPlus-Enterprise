import { Appointment } from "../../src/modules/agenda/domain/entities/Appointment";
import { AppointmentReminder } from "../../src/modules/agenda/domain/entities/AppointmentReminder";

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment => {
  const now = new Date("2026-03-30T10:00:00Z");
  const endTime = new Date("2026-03-30T11:00:00Z");

  return Appointment.create({
    id: "appointment-001",
    clinicId: "clinic-1",
    patientId: "patient-1",
    dentistId: "dentist-1",
    startTime: now,
    endTime: endTime,
    status: "AGENDADO",
    type: "CONSULTA",
    notes: "Consulta de rotina",
    createdBy: "user-1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};

const makeReminder = (
  overrides: Partial<AppointmentReminder> = {},
): AppointmentReminder => {
  const now = new Date("2026-03-30T10:00:00Z");

  return AppointmentReminder.restore({
    id: "reminder-001",
    appointmentId: "appointment-001",
    messageTemplate: "Olá, lembre-se da sua consulta.",
    reminderType: "LEMBRETE",
    scheduledFor: now,
    status: "PENDENTE",
    phoneNumber: "+5511999999999",
    createdAt: now,
    ...overrides,
  });
};

describe("Appointment Domain Entity", () => {
  describe("create", () => {
    it("creates an appointment with the given values", () => {
      const apt = makeAppointment();

      expect(apt.id).toBe("appointment-001");
      expect(apt.clinicId).toBe("clinic-1");
      expect(apt.patientId).toBe("patient-1");
      expect(apt.dentistId).toBe("dentist-1");
      expect(apt.status).toBe("AGENDADO");
      expect(apt.type).toBe("CONSULTA");
      expect(apt.notes).toBe("Consulta de rotina");
    });

    it("supports all appointment types", () => {
      const types: Array<
        "CONSULTA" | "RETORNO" | "EMERGENCIA" | "PROCEDIMENTO"
      > = ["CONSULTA", "RETORNO", "EMERGENCIA", "PROCEDIMENTO"];

      types.forEach((type) => {
        const apt = makeAppointment({ type });
        expect(apt.type).toBe(type);
      });
    });

    it("allows undefined notes", () => {
      const apt = makeAppointment({ notes: undefined });
      expect(apt.notes).toBeUndefined();
    });

    it("preserves start and end times", () => {
      const start = new Date("2026-04-01T09:00:00Z");
      const end = new Date("2026-04-01T10:30:00Z");

      const apt = makeAppointment({ startTime: start, endTime: end });

      expect(apt.startTime).toEqual(start);
      expect(apt.endTime).toEqual(end);
    });
  });

  describe("start", () => {
    it("changes status to EM_ANDAMENTO", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.start();
      expect(apt.status).toBe("EM_ANDAMENTO");
    });

    it("can start from CONFIRMADO status", () => {
      const apt = makeAppointment({ status: "CONFIRMADO" });
      apt.start();
      expect(apt.status).toBe("EM_ANDAMENTO");
    });

    it("can be called multiple times (idempotent)", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.start();
      apt.start();
      expect(apt.status).toBe("EM_ANDAMENTO");
    });
  });

  describe("confirm", () => {
    it("changes status to CONFIRMADO", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.confirm();
      expect(apt.status).toBe("CONFIRMADO");
    });

    it("can be called multiple times (idempotent)", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.confirm();
      apt.confirm();
      expect(apt.status).toBe("CONFIRMADO");
    });

    it("can confirm from any status", () => {
      const apt = makeAppointment({ status: "EM_ANDAMENTO" });
      apt.confirm();
      expect(apt.status).toBe("CONFIRMADO");
    });
  });

  describe("complete", () => {
    it("changes status to CONCLUIDO", () => {
      const apt = makeAppointment({ status: "EM_ANDAMENTO" });
      apt.complete();
      expect(apt.status).toBe("CONCLUIDO");
    });

    it("can complete from AGENDADO status", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.complete();
      expect(apt.status).toBe("CONCLUIDO");
    });

    it("can be called multiple times (idempotent)", () => {
      const apt = makeAppointment({ status: "EM_ANDAMENTO" });
      apt.complete();
      apt.complete();
      expect(apt.status).toBe("CONCLUIDO");
    });
  });

  describe("cancel", () => {
    it("changes status to CANCELADO", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.cancel();
      expect(apt.status).toBe("CANCELADO");
    });

    it("can cancel from CONFIRMADO status", () => {
      const apt = makeAppointment({ status: "CONFIRMADO" });
      apt.cancel();
      expect(apt.status).toBe("CANCELADO");
    });

    it("can cancel from EM_ANDAMENTO status", () => {
      const apt = makeAppointment({ status: "EM_ANDAMENTO" });
      apt.cancel();
      expect(apt.status).toBe("CANCELADO");
    });

    it("can be called multiple times (idempotent)", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.cancel();
      apt.cancel();
      expect(apt.status).toBe("CANCELADO");
    });
  });

  describe("markNoShow", () => {
    it("changes status to NAO_COMPARECEU", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.markNoShow();
      expect(apt.status).toBe("NAO_COMPARECEU");
    });

    it("can mark no-show from CONFIRMADO status", () => {
      const apt = makeAppointment({ status: "CONFIRMADO" });
      apt.markNoShow();
      expect(apt.status).toBe("NAO_COMPARECEU");
    });

    it("can be called multiple times (idempotent)", () => {
      const apt = makeAppointment({ status: "AGENDADO" });
      apt.markNoShow();
      apt.markNoShow();
      expect(apt.status).toBe("NAO_COMPARECEU");
    });
  });

  describe("workflow scenarios", () => {
    it("supports standard appointment workflow: schedule -> confirm -> start -> complete", () => {
      const apt = makeAppointment({ status: "AGENDADO" });

      // Patient confirms
      apt.confirm();
      expect(apt.status).toBe("CONFIRMADO");

      // Appointment starts
      apt.start();
      expect(apt.status).toBe("EM_ANDAMENTO");

      // Appointment completes
      apt.complete();
      expect(apt.status).toBe("CONCLUIDO");
    });

    it("supports quick workflow: schedule -> start -> complete", () => {
      const apt = makeAppointment({ status: "AGENDADO" });

      apt.start();
      expect(apt.status).toBe("EM_ANDAMENTO");

      apt.complete();
      expect(apt.status).toBe("CONCLUIDO");
    });

    it("supports emergency workflow: schedule -> complete", () => {
      const apt = makeAppointment({ status: "AGENDADO", type: "EMERGENCIA" });

      apt.complete();
      expect(apt.status).toBe("CONCLUIDO");
    });

    it("supports cancellation at any point", () => {
      // Cancel after scheduling
      const apt1 = makeAppointment({ status: "AGENDADO" });
      apt1.cancel();
      expect(apt1.status).toBe("CANCELADO");

      // Cancel after confirmation
      const apt2 = makeAppointment({ status: "CONFIRMADO" });
      apt2.cancel();
      expect(apt2.status).toBe("CANCELADO");

      // Cancel during appointment
      const apt3 = makeAppointment({ status: "EM_ANDAMENTO" });
      apt3.cancel();
      expect(apt3.status).toBe("CANCELADO");
    });

    it("supports no-show marking", () => {
      const apt = makeAppointment({ status: "CONFIRMADO" });

      // Patient doesn't show up
      apt.markNoShow();
      expect(apt.status).toBe("NAO_COMPARECEU");
    });
  });

  describe("time management", () => {
    it("handles appointment spanning multiple hours", () => {
      const start = new Date("2026-04-01T09:00:00Z");
      const end = new Date("2026-04-01T12:00:00Z");

      const apt = makeAppointment({ startTime: start, endTime: end });

      const duration = apt.endTime.getTime() - apt.startTime.getTime();
      const hours = duration / (1000 * 60 * 60);

      expect(hours).toBe(3);
    });

    it("handles 30-minute appointments", () => {
      const start = new Date("2026-04-01T14:00:00Z");
      const end = new Date("2026-04-01T14:30:00Z");

      const apt = makeAppointment({ startTime: start, endTime: end });

      const duration = apt.endTime.getTime() - apt.startTime.getTime();
      const minutes = duration / (1000 * 60);

      expect(minutes).toBe(30);
    });

    it("handles appointments spanning days (edge case)", () => {
      const start = new Date("2026-04-01T23:00:00Z");
      const end = new Date("2026-04-02T01:00:00Z");

      const apt = makeAppointment({ startTime: start, endTime: end });

      expect(apt.startTime.getUTCDate()).toBe(1);
      expect(apt.endTime.getUTCDate()).toBe(2);
    });
  });

  describe("all status values", () => {
    it("supports all expected status values", () => {
      const statuses = [
        "AGENDADO",
        "CONFIRMADO",
        "EM_ANDAMENTO",
        "CONCLUIDO",
        "CANCELADO",
        "NAO_COMPARECEU",
      ];

      statuses.forEach((status) => {
        const apt = makeAppointment({ status });
        expect(apt.status).toBe(status);
      });
    });
  });
});

describe("AppointmentReminder Domain Entity", () => {
  describe("create", () => {
    it("creates a reminder with PENDENTE status", () => {
      const now = new Date("2026-03-30T10:00:00Z");
      const reminder = AppointmentReminder.create({
        appointmentId: "appointment-001",
        messageTemplate: "Olá, lembre-se da sua consulta.",
        reminderType: "LEMBRETE",
        scheduledFor: now,
        phoneNumber: "+5511999999999",
      });

      expect(reminder.appointmentId).toBe("appointment-001");
      expect(reminder.messageTemplate).toBe("Olá, lembre-se da sua consulta.");
      expect(reminder.reminderType).toBe("LEMBRETE");
      expect(reminder.status).toBe("PENDENTE");
      expect(reminder.phoneNumber).toBe("+5511999999999");
      expect(reminder.id).toBeDefined();
      expect(reminder.createdAt).toBeInstanceOf(Date);
    });

    it("creates a confirmation reminder", () => {
      const now = new Date("2026-03-30T10:00:00Z");
      const reminder = AppointmentReminder.create({
        appointmentId: "appointment-002",
        messageTemplate: "Confirme sua consulta respondendo SIM.",
        reminderType: "CONFIRMACAO",
        scheduledFor: now,
      });

      expect(reminder.reminderType).toBe("CONFIRMACAO");
      expect(reminder.status).toBe("PENDENTE");
    });

    it("creates a recall reminder", () => {
      const now = new Date("2026-03-30T10:00:00Z");
      const reminder = AppointmentReminder.create({
        appointmentId: "appointment-003",
        messageTemplate: "Já faz um tempo, que tal agendar uma nova consulta?",
        reminderType: "RECALL",
        scheduledFor: now,
      });

      expect(reminder.reminderType).toBe("RECALL");
      expect(reminder.status).toBe("PENDENTE");
    });
  });

  describe("restore", () => {
    it("restores a reminder from database props", () => {
      const now = new Date("2026-03-30T10:00:00Z");
      const reminder = AppointmentReminder.restore({
        id: "reminder-001",
        appointmentId: "appointment-001",
        messageTemplate: "Olá, lembre-se da sua consulta.",
        reminderType: "LEMBRETE",
        scheduledFor: now,
        status: "ENVIADA",
        sentAt: now,
        phoneNumber: "+5511999999999",
        createdAt: now,
      });

      expect(reminder.id).toBe("reminder-001");
      expect(reminder.status).toBe("ENVIADA");
      expect(reminder.sentAt).toEqual(now);
    });
  });

  describe("enviar", () => {
    it("changes status from PENDENTE to ENVIADA and sets sentAt", () => {
      const reminder = makeReminder({ status: "PENDENTE" });
      reminder.enviar();

      expect(reminder.status).toBe("ENVIADA");
      expect(reminder.sentAt).toBeInstanceOf(Date);
    });

    it("throws if not PENDENTE", () => {
      const reminder = makeReminder({ status: "ENVIADA", sentAt: new Date() });

      expect(() => reminder.enviar()).toThrow(
        "Apenas lembretes PENDENTES podem ser enviados",
      );
    });

    it("throws if already CONFIRMADA", () => {
      const reminder = makeReminder({ status: "CONFIRMADA" });

      expect(() => reminder.enviar()).toThrow(
        "Apenas lembretes PENDENTES podem ser enviados",
      );
    });
  });

  describe("confirmar", () => {
    it("changes status from ENVIADA to CONFIRMADA", () => {
      const reminder = makeReminder({ status: "ENVIADA", sentAt: new Date() });
      reminder.confirmar();

      expect(reminder.status).toBe("CONFIRMADA");
    });

    it("throws if not ENVIADA", () => {
      const reminder = makeReminder({ status: "PENDENTE" });

      expect(() => reminder.confirmar()).toThrow(
        "Apenas lembretes ENVIADOS podem ser confirmados",
      );
    });
  });

  describe("marcarErro", () => {
    it("changes status to ERRO and sets errorMessage", () => {
      const reminder = makeReminder({ status: "PENDENTE" });
      reminder.marcarErro("Falha ao enviar mensagem");

      expect(reminder.status).toBe("ERRO");
      expect(reminder.errorMessage).toBe("Falha ao enviar mensagem");
    });
  });

  describe("cancelar", () => {
    it("changes status to CANCELADA from PENDENTE", () => {
      const reminder = makeReminder({ status: "PENDENTE" });
      reminder.cancelar();

      expect(reminder.status).toBe("CANCELADA");
    });

    it("changes status to CANCELADA from ENVIADA", () => {
      const reminder = makeReminder({ status: "ENVIADA", sentAt: new Date() });
      reminder.cancelar();

      expect(reminder.status).toBe("CANCELADA");
    });

    it("throws if already CONFIRMADA", () => {
      const reminder = makeReminder({ status: "CONFIRMADA" });

      expect(() => reminder.cancelar()).toThrow(
        "Não é possível cancelar um lembrete já confirmado",
      );
    });
  });

  describe("workflow scenarios", () => {
    it("supports standard reminder workflow: create -> send -> confirm", () => {
      const now = new Date("2026-03-30T10:00:00Z");
      const reminder = AppointmentReminder.create({
        appointmentId: "appointment-001",
        messageTemplate: "Olá, lembre-se da sua consulta.",
        reminderType: "LEMBRETE",
        scheduledFor: now,
        phoneNumber: "+5511999999999",
      });

      expect(reminder.status).toBe("PENDENTE");

      reminder.enviar();
      expect(reminder.status).toBe("ENVIADA");
      expect(reminder.sentAt).toBeInstanceOf(Date);

      reminder.confirmar();
      expect(reminder.status).toBe("CONFIRMADA");
    });

    it("supports error workflow: create -> send -> error", () => {
      const now = new Date("2026-03-30T10:00:00Z");
      const reminder = AppointmentReminder.create({
        appointmentId: "appointment-001",
        messageTemplate: "Olá, lembre-se da sua consulta.",
        reminderType: "LEMBRETE",
        scheduledFor: now,
      });

      reminder.enviar();
      expect(reminder.status).toBe("ENVIADA");

      reminder.marcarErro("Serviço de WhatsApp indisponível");
      expect(reminder.status).toBe("ERRO");
      expect(reminder.errorMessage).toBe("Serviço de WhatsApp indisponível");
    });

    it("supports cancellation workflow: create -> cancel", () => {
      const now = new Date("2026-03-30T10:00:00Z");
      const reminder = AppointmentReminder.create({
        appointmentId: "appointment-001",
        messageTemplate: "Olá, lembre-se da sua consulta.",
        reminderType: "LEMBRETE",
        scheduledFor: now,
      });

      reminder.cancelar();
      expect(reminder.status).toBe("CANCELADA");
    });
  });
});
