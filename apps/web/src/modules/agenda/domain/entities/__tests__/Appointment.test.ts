import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Appointment, AppointmentProps } from "../Appointment"

function makeProps(overrides?: Partial<AppointmentProps>): AppointmentProps {
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return {
    id: "apt-1",
    clinicId: "clinic-1",
    patientId: "patient-1",
    dentistId: "dentist-1",
    scheduledDatetime: futureDate,
    durationMinutes: 30,
    status: "AGENDADO",
    appointmentType: "CONSULTA",
    notes: undefined,
    noShow: false,
    createdBy: "user-1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  }
}

describe("Appointment", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("constructor validation", () => {
    it("should create an appointment with valid props", () => {
      const apt = new Appointment(makeProps())
      expect(apt.id).toBe("apt-1")
    })

    it("should throw when clinicId is missing", () => {
      expect(() => new Appointment(makeProps({ clinicId: "" }))).toThrow(
        "ID da clínica é obrigatório",
      )
    })

    it("should throw when patientId is missing", () => {
      expect(() => new Appointment(makeProps({ patientId: "" }))).toThrow(
        "ID do paciente é obrigatório",
      )
    })

    it("should throw when dentistId is missing", () => {
      expect(() => new Appointment(makeProps({ dentistId: "" }))).toThrow(
        "ID do dentista é obrigatório",
      )
    })

    it("should throw when scheduledDatetime is missing", () => {
      expect(
        () => new Appointment(makeProps({ scheduledDatetime: undefined as unknown as Date })),
      ).toThrow("Data/hora do agendamento é obrigatória")
    })

    it("should throw when durationMinutes is not a multiple of 15", () => {
      expect(() => new Appointment(makeProps({ durationMinutes: 20 }))).toThrow(
        "Duração deve ser múltiplo de 15 minutos",
      )
    })

    it("should throw when durationMinutes is zero or negative", () => {
      expect(() => new Appointment(makeProps({ durationMinutes: 0 }))).toThrow(
        "Duração deve ser múltiplo de 15 minutos",
      )
    })

    it("should throw when scheduling in the past for a new appointment", () => {
      vi.setSystemTime(new Date("2024-06-01T12:00:00Z"))
      expect(
        () =>
          new Appointment(
            makeProps({
              id: "",
              scheduledDatetime: new Date("2024-06-01T10:00:00Z"),
            }),
          ),
      ).toThrow("Não é possível agendar no passado")
    })

    it("should allow past scheduledDatetime if id is present (existing appointment)", () => {
      vi.setSystemTime(new Date("2024-06-01T12:00:00Z"))
      const apt = new Appointment(
        makeProps({
          id: "existing-id",
          scheduledDatetime: new Date("2024-06-01T10:00:00Z"),
        }),
      )
      expect(apt.id).toBe("existing-id")
    })
  })

  describe("getters", () => {
    it("should return all property values", () => {
      const apt = new Appointment(makeProps())
      expect(apt.clinicId).toBe("clinic-1")
      expect(apt.patientId).toBe("patient-1")
      expect(apt.dentistId).toBe("dentist-1")
      expect(apt.durationMinutes).toBe(30)
      expect(apt.status).toBe("AGENDADO")
      expect(apt.appointmentType).toBe("CONSULTA")
      expect(apt.createdBy).toBe("user-1")
      expect(apt.noShow).toBe(false)
    })
  })

  describe("computed properties", () => {
    it("should calculate endDatetime correctly", () => {
      const apt = new Appointment(makeProps({ scheduledDatetime: new Date("2024-01-01T10:00:00Z") }))
      expect(apt.endDatetime.toISOString()).toBe("2024-01-01T10:30:00.000Z")
    })

    it("should allow confirmation when status is AGENDADO", () => {
      const apt = new Appointment(makeProps({ status: "AGENDADO" }))
      expect(apt.canBeConfirmed).toBe(true)
    })

    it("should not allow confirmation when status is CONFIRMADO", () => {
      const apt = new Appointment(makeProps({ status: "CONFIRMADO" }))
      expect(apt.canBeConfirmed).toBe(false)
    })

    it("should allow cancellation when status is AGENDADO or CONFIRMADO", () => {
      expect(new Appointment(makeProps({ status: "AGENDADO" })).canBeCancelled).toBe(true)
      expect(new Appointment(makeProps({ status: "CONFIRMADO" })).canBeCancelled).toBe(true)
      expect(new Appointment(makeProps({ status: "REALIZADO" })).canBeCancelled).toBe(false)
      expect(new Appointment(makeProps({ status: "CANCELADO" })).canBeCancelled).toBe(false)
    })

    it("should allow reschedule when status is AGENDADO or CONFIRMADO", () => {
      expect(new Appointment(makeProps({ status: "AGENDADO" })).canBeRescheduled).toBe(true)
      expect(new Appointment(makeProps({ status: "CANCELADO" })).canBeRescheduled).toBe(false)
    })
  })

  describe("confirm", () => {
    it("should change status to CONFIRMADO and set confirmedAt", () => {
      vi.setSystemTime(new Date("2024-06-01T08:00:00Z"))
      const apt = new Appointment(
        makeProps({ scheduledDatetime: new Date("2024-06-01T12:00:00Z") }),
      )
      apt.confirm()
      expect(apt.status).toBe("CONFIRMADO")
      expect(apt.confirmedAt).toBeInstanceOf(Date)
    })

    it("should throw if status is not AGENDADO", () => {
      const apt = new Appointment(makeProps({ status: "CONFIRMADO" }))
      expect(() => apt.confirm()).toThrow(
        "Apenas agendamentos com status AGENDADO podem ser confirmados",
      )
    })

    it("should throw if confirming less than 2h before appointment", () => {
      vi.setSystemTime(new Date("2024-06-01T11:00:00Z"))
      const apt = new Appointment(
        makeProps({ scheduledDatetime: new Date("2024-06-01T12:00:00Z") }),
      )
      expect(() => apt.confirm()).toThrow(
        "Não é possível confirmar com menos de 2 horas de antecedência",
      )
    })
  })

  describe("cancel", () => {
    it("should change status to CANCELADO and set cancelledAt", () => {
      vi.setSystemTime(new Date("2024-06-01T00:00:00Z"))
      const apt = new Appointment(
        makeProps({ scheduledDatetime: new Date("2024-06-02T12:00:00Z") }),
      )
      apt.cancel("Paciente solicitou")
      expect(apt.status).toBe("CANCELADO")
      expect(apt.cancellationReason).toBe("Paciente solicitou")
      expect(apt.cancelledAt).toBeInstanceOf(Date)
    })

    it("should throw if appointment cannot be cancelled", () => {
      const apt = new Appointment(makeProps({ status: "REALIZADO" }))
      expect(() => apt.cancel()).toThrow("Este agendamento não pode ser cancelado")
    })

    it("should require reason when cancelling less than 24h before", () => {
      vi.setSystemTime(new Date("2024-06-01T20:00:00Z"))
      const apt = new Appointment(
        makeProps({ scheduledDatetime: new Date("2024-06-02T12:00:00Z") }),
      )
      expect(() => apt.cancel()).toThrow(
        "É obrigatório informar o motivo do cancelamento com menos de 24h de antecedência",
      )
    })
  })

  describe("reschedule", () => {
    it("should update scheduledDatetime and reset status to AGENDADO", () => {
      vi.setSystemTime(new Date("2024-06-01T00:00:00Z"))
      const apt = new Appointment(
        makeProps({
          status: "CONFIRMADO",
          confirmedAt: new Date("2024-06-01T00:00:00Z"),
          scheduledDatetime: new Date("2024-06-02T12:00:00Z"),
        }),
      )
      const newDate = new Date("2024-06-03T14:00:00Z")
      apt.reschedule(newDate)
      expect(apt.scheduledDatetime).toEqual(newDate)
      expect(apt.status).toBe("AGENDADO")
      expect(apt.confirmedAt).toBeUndefined()
    })

    it("should throw if rescheduling to the past", () => {
      vi.setSystemTime(new Date("2024-06-02T12:00:00Z"))
      const apt = new Appointment(
        makeProps({ scheduledDatetime: new Date("2024-06-03T12:00:00Z") }),
      )
      expect(() => apt.reschedule(new Date("2024-06-02T10:00:00Z"))).toThrow(
        "Não é possível reagendar para o passado",
      )
    })

    it("should throw if appointment cannot be rescheduled", () => {
      const apt = new Appointment(makeProps({ status: "CANCELADO" }))
      expect(() => apt.reschedule(new Date("2025-01-01T10:00:00Z"))).toThrow(
        "Este agendamento não pode ser reagendado",
      )
    })
  })

  describe("markAsCompleted", () => {
    it("should set status to REALIZADO and completedAt", () => {
      const apt = new Appointment(makeProps({ status: "CONFIRMADO" }))
      apt.markAsCompleted()
      expect(apt.status).toBe("REALIZADO")
      expect(apt.completedAt).toBeInstanceOf(Date)
    })

    it("should throw if appointment is cancelled", () => {
      const apt = new Appointment(makeProps({ status: "CANCELADO" }))
      expect(() => apt.markAsCompleted()).toThrow(
        "Não é possível marcar agendamento cancelado como realizado",
      )
    })
  })

  describe("markAsNoShow", () => {
    it("should set status to FALTOU and noShow to true", () => {
      const apt = new Appointment(makeProps({ status: "CONFIRMADO" }))
      apt.markAsNoShow()
      expect(apt.status).toBe("FALTOU")
      expect(apt.noShow).toBe(true)
    })

    it("should throw if status is not AGENDADO or CONFIRMADO", () => {
      const apt = new Appointment(makeProps({ status: "REALIZADO" }))
      expect(() => apt.markAsNoShow()).toThrow(
        "Apenas agendamentos AGENDADO ou CONFIRMADO podem ser marcados como falta",
      )
    })
  })

  describe("updateNotes", () => {
    it("should update notes and updatedAt", () => {
      const apt = new Appointment(makeProps())
      apt.updateNotes("Novas observações")
      expect(apt.notes).toBe("Novas observações")
    })
  })

  describe("overlaps", () => {
    it("should return true when appointments overlap", () => {
      const apt1 = new Appointment(
        makeProps({ scheduledDatetime: new Date("2024-01-01T10:00:00Z"), durationMinutes: 30 }),
      )
      const apt2 = new Appointment(
        makeProps({
          id: "apt-2",
          scheduledDatetime: new Date("2024-01-01T10:15:00Z"),
          durationMinutes: 30,
        }),
      )
      expect(apt1.overlaps(apt2)).toBe(true)
      expect(apt2.overlaps(apt1)).toBe(true)
    })

    it("should return false when appointments do not overlap", () => {
      const apt1 = new Appointment(
        makeProps({ scheduledDatetime: new Date("2024-01-01T10:00:00Z"), durationMinutes: 30 }),
      )
      const apt2 = new Appointment(
        makeProps({
          id: "apt-2",
          scheduledDatetime: new Date("2024-01-01T11:00:00Z"),
          durationMinutes: 30,
        }),
      )
      expect(apt1.overlaps(apt2)).toBe(false)
    })
  })

  describe("toJSON", () => {
    it("should return a copy of props", () => {
      const apt = new Appointment(makeProps())
      const json = apt.toJSON()
      expect(json.id).toBe("apt-1")
      expect(json).not.toBe(apt)
    })
  })
})
