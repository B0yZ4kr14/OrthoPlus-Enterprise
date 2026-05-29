import { describe, it, expect, vi, beforeEach } from "vitest";
import { CancelAppointmentUseCase } from "../CancelAppointmentUseCase";
import { Appointment } from "../../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

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
};

function createMockAppointment(
  status: "AGENDADO" | "CONFIRMADO" | "REALIZADO" | "CANCELADO",
): Appointment {
  return new Appointment({
    id: "apt-1",
    clinicId: "clinic-1",
    patientId: "patient-1",
    dentistId: "dentist-1",
    scheduledDatetime: new Date("2025-06-01T10:00:00Z"),
    durationMinutes: 30,
    status,
    appointmentType: "CONSULTA",
    notes: undefined,
    noShow: false,
    createdBy: "user-1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  });
}

describe("CancelAppointmentUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel an AGENDADO appointment and update repository", async () => {
    const apt = createMockAppointment("AGENDADO");
    mockRepo.findById = vi.fn().mockResolvedValue(apt);
    mockRepo.update = vi
      .fn()
      .mockImplementation((a: Appointment) => Promise.resolve(a));

    const useCase = new CancelAppointmentUseCase(mockRepo);
    const result = await useCase.execute({
      appointmentId: "apt-1",
      reason: "Motivo do cancelamento",
    });

    expect(result.status).toBe("CANCELADO");
    expect(result.cancellationReason).toBe("Motivo do cancelamento");
    expect(mockRepo.update).toHaveBeenCalledTimes(1);
  });

  it("should cancel a CONFIRMADO appointment", async () => {
    const apt = createMockAppointment("CONFIRMADO");
    // Schedule far in the future so no 24h reason requirement triggers
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    mockRepo.findById = vi.fn().mockResolvedValue(apt);
    mockRepo.update = vi
      .fn()
      .mockImplementation((a: Appointment) => Promise.resolve(a));

    const useCase = new CancelAppointmentUseCase(mockRepo);
    const result = await useCase.execute({ appointmentId: "apt-1" });

    expect(result.status).toBe("CANCELADO");
    vi.useRealTimers();
  });

  it("should throw when appointment is not found", async () => {
    mockRepo.findById = vi.fn().mockResolvedValue(null);

    const useCase = new CancelAppointmentUseCase(mockRepo);
    await expect(
      useCase.execute({ appointmentId: "missing-id" }),
    ).rejects.toThrow("Agendamento não encontrado");
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("should throw when appointment cannot be cancelled", async () => {
    const apt = createMockAppointment("REALIZADO");
    mockRepo.findById = vi.fn().mockResolvedValue(apt);

    const useCase = new CancelAppointmentUseCase(mockRepo);
    await expect(useCase.execute({ appointmentId: "apt-1" })).rejects.toThrow(
      "Este agendamento não pode ser cancelado",
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
