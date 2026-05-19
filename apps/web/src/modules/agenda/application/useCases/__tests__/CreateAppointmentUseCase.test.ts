import { describe, it, expect, vi, beforeEach } from "vitest"
import { CreateAppointmentUseCase } from "../CreateAppointmentUseCase"
import { Appointment } from "../../../domain/entities/Appointment"
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository"
import { IBlockedTimeRepository } from "../../../domain/repositories/IBlockedTimeRepository"

const mockAppointmentRepo: IAppointmentRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByClinicId: vi.fn(),
  findByPatient: vi.fn(),
  findByDentist: vi.fn(),
  findByDateRange: vi.fn(),
  findByDentistAndDateRange: vi.fn(),
  findConflicts: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const mockBlockedTimeRepo: IBlockedTimeRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByDentist: vi.fn(),
  findByDentistAndDateRange: vi.fn(),
  findByClinicId: vi.fn(),
  delete: vi.fn(),
}

describe("CreateAppointmentUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const input = {
    clinicId: "clinic-1",
    patientId: "patient-1",
    dentistId: "dentist-1",
    scheduledDatetime: new Date("2025-06-01T10:00:00Z"),
    durationMinutes: 30,
    appointmentType: "CONSULTA",
    notes: "Primeira consulta",
    createdBy: "user-1",
  }

  it("should create and save an appointment when no conflicts exist", async () => {
    mockBlockedTimeRepo.findByDentistAndDateRange = vi.fn().mockResolvedValue([])
    mockAppointmentRepo.findConflicts = vi.fn().mockResolvedValue([])
    mockAppointmentRepo.save = vi.fn().mockImplementation((apt: Appointment) => Promise.resolve(apt))

    const useCase = new CreateAppointmentUseCase(mockAppointmentRepo, mockBlockedTimeRepo)
    const result = await useCase.execute(input)

    expect(result).toBeInstanceOf(Appointment)
    expect(result.clinicId).toBe("clinic-1")
    expect(result.patientId).toBe("patient-1")
    expect(result.status).toBe("AGENDADO")
    expect(mockAppointmentRepo.save).toHaveBeenCalledTimes(1)
  })

  it("should throw when dentist has blocked time in the period", async () => {
    mockBlockedTimeRepo.findByDentistAndDateRange = vi.fn().mockResolvedValue([
      { id: "bt-1" },
    ] as any)

    const useCase = new CreateAppointmentUseCase(mockAppointmentRepo, mockBlockedTimeRepo)
    await expect(useCase.execute(input)).rejects.toThrow("Horário bloqueado para este dentista")
    expect(mockAppointmentRepo.save).not.toHaveBeenCalled()
  })

  it("should throw when there is an appointment conflict", async () => {
    mockBlockedTimeRepo.findByDentistAndDateRange = vi.fn().mockResolvedValue([])
    mockAppointmentRepo.findConflicts = vi.fn().mockResolvedValue([{ id: "apt-2" }] as any)

    const useCase = new CreateAppointmentUseCase(mockAppointmentRepo, mockBlockedTimeRepo)
    await expect(useCase.execute(input)).rejects.toThrow("Já existe um agendamento neste horário")
    expect(mockAppointmentRepo.save).not.toHaveBeenCalled()
  })

  it("should pass correct endDatetime to findConflicts", async () => {
    mockBlockedTimeRepo.findByDentistAndDateRange = vi.fn().mockResolvedValue([])
    mockAppointmentRepo.findConflicts = vi.fn().mockResolvedValue([])
    mockAppointmentRepo.save = vi.fn().mockImplementation((apt: Appointment) => Promise.resolve(apt))

    const useCase = new CreateAppointmentUseCase(mockAppointmentRepo, mockBlockedTimeRepo)
    await useCase.execute(input)

    const conflictCall = (mockAppointmentRepo.findConflicts as any).mock.calls[0]
    expect(conflictCall[0]).toBe("dentist-1")
    expect(conflictCall[1]).toEqual(new Date("2025-06-01T10:00:00Z"))
    expect(conflictCall[2]).toEqual(new Date("2025-06-01T10:30:00Z"))
  })

  it("should pass correct date range to blockedTimeRepository", async () => {
    mockBlockedTimeRepo.findByDentistAndDateRange = vi.fn().mockResolvedValue([])
    mockAppointmentRepo.findConflicts = vi.fn().mockResolvedValue([])
    mockAppointmentRepo.save = vi.fn().mockImplementation((apt: Appointment) => Promise.resolve(apt))

    const useCase = new CreateAppointmentUseCase(mockAppointmentRepo, mockBlockedTimeRepo)
    await useCase.execute(input)

    const blockedCall = (mockBlockedTimeRepo.findByDentistAndDateRange as any).mock.calls[0]
    expect(blockedCall[0]).toBe("dentist-1")
    expect(blockedCall[1]).toEqual(new Date("2025-06-01T10:00:00Z"))
    expect(blockedCall[2]).toEqual(new Date("2025-06-01T10:30:00Z"))
  })
})
