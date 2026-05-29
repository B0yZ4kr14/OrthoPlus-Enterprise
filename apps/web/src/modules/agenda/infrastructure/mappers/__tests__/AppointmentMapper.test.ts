import { describe, it, expect } from "vitest";
import { AppointmentMapper } from "../AppointmentMapper";
import { Appointment } from "../../../domain/entities/Appointment";

describe("AppointmentMapper", () => {
  describe("toDomain", () => {
    it("should map database row to Appointment entity", () => {
      const row = {
        id: "apt-1",
        clinic_id: "clinic-1",
        patient_id: "patient-1",
        dentist_id: "dentist-1",
        start_time: "2024-01-01T10:00:00.000Z",
        end_time: "2024-01-01T10:30:00.000Z",
        status: "AGENDADO",
        title: "CONSULTA",
        description: "Primeira consulta",
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        treatment_id: null,
      };

      const apt = AppointmentMapper.toDomain(row);

      expect(apt).toBeInstanceOf(Appointment);
      expect(apt.id).toBe("apt-1");
      expect(apt.clinicId).toBe("clinic-1");
      expect(apt.patientId).toBe("patient-1");
      expect(apt.dentistId).toBe("dentist-1");
      expect(apt.scheduledDatetime.toISOString()).toBe(
        "2024-01-01T10:00:00.000Z",
      );
      expect(apt.durationMinutes).toBe(30);
      expect(apt.status).toBe("AGENDADO");
      expect(apt.appointmentType).toBe("CONSULTA");
      expect(apt.notes).toBe("Primeira consulta");
      expect(apt.createdBy).toBe("user-1");
    });

    it("should default appointmentType to CONSULTA when title is null", () => {
      const row = {
        id: "apt-2",
        clinic_id: "clinic-1",
        patient_id: "patient-1",
        dentist_id: "dentist-1",
        start_time: "2024-01-01T10:00:00.000Z",
        end_time: "2024-01-01T10:15:00.000Z",
        status: "AGENDADO",
        title: null,
        description: null,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        treatment_id: null,
      };

      const apt = AppointmentMapper.toDomain(row);
      expect(apt.appointmentType).toBe("CONSULTA");
      expect(apt.notes).toBeUndefined();
    });

    it("should calculate durationMinutes correctly for 1 hour", () => {
      const row = {
        id: "apt-3",
        clinic_id: "clinic-1",
        patient_id: "patient-1",
        dentist_id: "dentist-1",
        start_time: "2024-01-01T10:00:00.000Z",
        end_time: "2024-01-01T11:00:00.000Z",
        status: "AGENDADO",
        title: "PROCEDIMENTO",
        description: null,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        treatment_id: null,
      };

      const apt = AppointmentMapper.toDomain(row);
      expect(apt.durationMinutes).toBe(60);
    });
  });

  describe("toPersistence", () => {
    it("should map Appointment entity to database insert format", () => {
      const apt = new Appointment({
        id: "apt-1",
        clinicId: "clinic-1",
        patientId: "patient-1",
        dentistId: "dentist-1",
        scheduledDatetime: new Date("2024-01-01T10:00:00.000Z"),
        durationMinutes: 45,
        status: "AGENDADO",
        appointmentType: "AVALIACAO",
        notes: "Observação",
        noShow: false,
        createdBy: "user-1",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });

      const data = AppointmentMapper.toPersistence(apt);

      expect(data.clinic_id).toBe("clinic-1");
      expect(data.patient_id).toBe("patient-1");
      expect(data.dentist_id).toBe("dentist-1");
      expect(data.start_time).toBe("2024-01-01T10:00:00.000Z");
      expect(data.end_time).toBe("2024-01-01T10:45:00.000Z");
      expect(data.status).toBe("AGENDADO");
      expect(data.title).toBe("AVALIACAO");
      expect(data.description).toBe("Observação");
      expect(data.created_by).toBe("user-1");
      expect(data.treatment_id).toBeNull();
    });

    it("should handle undefined notes by setting description to null", () => {
      const apt = new Appointment({
        id: "apt-1",
        clinicId: "clinic-1",
        patientId: "patient-1",
        dentistId: "dentist-1",
        scheduledDatetime: new Date("2024-01-01T10:00:00.000Z"),
        durationMinutes: 30,
        status: "AGENDADO",
        appointmentType: "CONSULTA",
        notes: undefined,
        noShow: false,
        createdBy: "user-1",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });

      const data = AppointmentMapper.toPersistence(apt);
      expect(data.description).toBeNull();
    });
  });

  describe("toUpdate", () => {
    it("should map Appointment entity to partial update format", () => {
      const apt = new Appointment({
        id: "apt-1",
        clinicId: "clinic-1",
        patientId: "patient-1",
        dentistId: "dentist-1",
        scheduledDatetime: new Date("2024-01-01T10:00:00.000Z"),
        durationMinutes: 30,
        status: "CONFIRMADO",
        appointmentType: "RETORNO",
        notes: "Notas atualizadas",
        noShow: false,
        createdBy: "user-1",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });

      const data = AppointmentMapper.toUpdate(apt);

      expect(data.patient_id).toBe("patient-1");
      expect(data.dentist_id).toBe("dentist-1");
      expect(data.start_time).toBe("2024-01-01T10:00:00.000Z");
      expect(data.end_time).toBe("2024-01-01T10:30:00.000Z");
      expect(data.status).toBe("CONFIRMADO");
      expect(data.title).toBe("RETORNO");
      expect(data.description).toBe("Notas atualizadas");
      expect(data.updated_at).toBeDefined();
    });
  });
});
