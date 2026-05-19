import { describe, it, expect, vi, beforeEach } from "vitest"
import { ListAppointmentsUseCase } from "../ListAppointmentsUseCase"
import { Appointment } from "../../../domain/entities/Appointment"
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository"

const mockRepo: IAppointmentRepository = {
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

describe("ListAppointmentsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call findByDentistAndDateRange when dentistId + startDate + endDate provided", async () => {
    const mockResult = [{ id: "apt-1" }] as unknown as Appointment[]
    mockRepo.findByDentistAndDateRange = vi.fn().mockResolvedValue(mockResult)

    const useCase = new ListAppointmentsUseCase(mockRepo)
    const result = await useCase.execute({
      dentistId: "dentist-1",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    })

    expect(result).toBe(mockResult)
    expect(mockRepo.findByDentistAndDateRange).toHaveBeenCalledWith(
      "dentist-1",
      new Date("2024-01-01"),
      new Date("2024-01-31"),
    )
  })

  it("should call findByDateRange when clinicId + startDate + endDate provided", async () => {
    const mockResult = [{ id: "apt-2" }] as unknown as Appointment[]
    mockRepo.findByDateRange = vi.fn().mockResolvedValue(mockResult)

    const useCase = new ListAppointmentsUseCase(mockRepo)
    const result = await useCase.execute({
      clinicId: "clinic-1",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    })

    expect(result).toBe(mockResult)
    expect(mockRepo.findByDateRange).toHaveBeenCalledWith(
      "clinic-1",
      new Date("2024-01-01"),
      new Date("2024-01-31"),
    )
  })

  it("should call findByPatient when patientId provided", async () => {
    const mockResult = [{ id: "apt-3" }] as unknown as Appointment[]
    mockRepo.findByPatient = vi.fn().mockResolvedValue(mockResult)

    const useCase = new ListAppointmentsUseCase(mockRepo)
    const result = await useCase.execute({ patientId: "patient-1" })

    expect(result).toBe(mockResult)
    expect(mockRepo.findByPatient).toHaveBeenCalledWith("patient-1")
  })

  it("should call findByDentist when dentistId provided without dates", async () => {
    const mockResult = [{ id: "apt-4" }] as unknown as Appointment[]
    mockRepo.findByDentist = vi.fn().mockResolvedValue(mockResult)

    const useCase = new ListAppointmentsUseCase(mockRepo)
    const result = await useCase.execute({ dentistId: "dentist-1" })

    expect(result).toBe(mockResult)
    expect(mockRepo.findByDentist).toHaveBeenCalledWith("dentist-1")
  })

  it("should call findByClinicId when only clinicId provided", async () => {
    const mockResult = [{ id: "apt-5" }] as unknown as Appointment[]
    mockRepo.findByClinicId = vi.fn().mockResolvedValue(mockResult)

    const useCase = new ListAppointmentsUseCase(mockRepo)
    const result = await useCase.execute({ clinicId: "clinic-1" })

    expect(result).toBe(mockResult)
    expect(mockRepo.findByClinicId).toHaveBeenCalledWith("clinic-1")
  })

  it("should throw when no parameters provided", async () => {
    const useCase = new ListAppointmentsUseCase(mockRepo)
    await expect(useCase.execute({})).rejects.toThrow(
      "Parâmetros insuficientes para buscar agendamentos",
    )
  })
})
