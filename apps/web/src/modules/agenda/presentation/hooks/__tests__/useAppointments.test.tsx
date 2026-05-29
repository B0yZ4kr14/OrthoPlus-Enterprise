import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useAppointments } from "../useAppointments";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

function TestConsumer({
  filters,
}: {
  filters?: Parameters<typeof useAppointments>[0];
}) {
  const {
    appointments,
    isLoading,
    createAppointment,
    cancelAppointment,
    confirmAppointment,
    isCreating,
    isCancelling,
  } = useAppointments(filters);

  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
      <div data-testid="creating">{isCreating ? "creating" : "idle"}</div>
      <div data-testid="cancelling">{isCancelling ? "cancelling" : "idle"}</div>
      <div data-testid="count">{appointments.length}</div>
      <div data-testid="appointments">
        {JSON.stringify(
          appointments.map((a) => ({ id: a.id, status: a.status })),
        )}
      </div>
      <button
        data-testid="create"
        onClick={() =>
          createAppointment({
            clinicId: "clinic-1",
            patientId: "patient-1",
            dentistId: "dentist-1",
            scheduledDatetime: new Date("2025-06-01T10:00:00Z"),
            durationMinutes: 30,
            appointmentType: "CONSULTA",
          })
        }
      >
        Create
      </button>
      <button
        data-testid="cancel"
        onClick={() =>
          cancelAppointment({ appointmentId: "apt-1", reason: "Test" })
        }
      >
        Cancel
      </button>
      <button data-testid="confirm" onClick={() => confirmAppointment("apt-1")}>
        Confirm
      </button>
    </div>
  );
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useAppointments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
  });

  it("should fetch appointments when filters are provided", async () => {
    mockGet.mockResolvedValue([
      {
        id: "apt-1",
        clinic_id: "clinic-1",
        patient_id: "patient-1",
        dentist_id: "dentist-1",
        start_time: "2025-06-01T10:00:00.000Z",
        end_time: "2025-06-01T10:30:00.000Z",
        status: "AGENDADO",
        title: "CONSULTA",
        description: null,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        treatment_id: null,
      },
    ]);

    render(
      <TestConsumer
        filters={{
          clinicId: "clinic-1",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-06-07"),
        }}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("ready"),
    );
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("appointments").textContent).toContain("apt-1");
  });

  it("should not fetch when filters are absent", async () => {
    render(<TestConsumer />, { wrapper: createWrapper() });
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("ready"),
    );
    expect(mockGet).not.toHaveBeenCalled();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("should create an appointment via mutation", async () => {
    mockGet.mockResolvedValue([]);
    mockPost.mockResolvedValue({
      id: "apt-new",
      clinic_id: "clinic-1",
      patient_id: "patient-1",
      dentist_id: "dentist-1",
      start_time: "2025-06-01T10:00:00.000Z",
      end_time: "2025-06-01T10:30:00.000Z",
      status: "AGENDADO",
      title: "CONSULTA",
      description: null,
      created_by: "user-1",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
      treatment_id: null,
    });

    render(
      <TestConsumer
        filters={{
          clinicId: "clinic-1",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-06-07"),
        }}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("ready"),
    );

    await act(async () => {
      screen.getByTestId("create").click();
    });

    await waitFor(() =>
      expect(screen.getByTestId("creating").textContent).toBe("idle"),
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/agenda/appointments",
      expect.any(Object),
    );
  });

  it("should cancel an appointment via mutation", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/agenda/appointments") {
        return Promise.resolve([
          {
            id: "apt-1",
            clinic_id: "clinic-1",
            patient_id: "patient-1",
            dentist_id: "dentist-1",
            start_time: "2025-06-01T10:00:00.000Z",
            end_time: "2025-06-01T10:30:00.000Z",
            status: "AGENDADO",
            title: "CONSULTA",
            description: null,
            created_by: "user-1",
            created_at: "2024-01-01T00:00:00.000Z",
            updated_at: "2024-01-01T00:00:00.000Z",
            treatment_id: null,
          },
        ]);
      }
      if (url.includes("/agenda/appointments/apt-1")) {
        return Promise.resolve({
          id: "apt-1",
          clinic_id: "clinic-1",
          patient_id: "patient-1",
          dentist_id: "dentist-1",
          start_time: "2025-06-01T10:00:00.000Z",
          end_time: "2025-06-01T10:30:00.000Z",
          status: "AGENDADO",
          title: "CONSULTA",
          description: null,
          created_by: "user-1",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
          treatment_id: null,
        });
      }
      return Promise.resolve({});
    });
    mockPatch.mockResolvedValue({
      id: "apt-1",
      clinic_id: "clinic-1",
      patient_id: "patient-1",
      dentist_id: "dentist-1",
      start_time: "2025-06-01T10:00:00.000Z",
      end_time: "2025-06-01T10:30:00.000Z",
      status: "CANCELADO",
      title: "CONSULTA",
      description: null,
      created_by: "user-1",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
      treatment_id: null,
    });

    render(
      <TestConsumer
        filters={{
          clinicId: "clinic-1",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-06-07"),
        }}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("ready"),
    );

    await act(async () => {
      screen.getByTestId("cancel").click();
    });

    await waitFor(() =>
      expect(screen.getByTestId("cancelling").textContent).toBe("idle"),
    );
    expect(mockPatch).toHaveBeenCalledWith(
      "/agenda/appointments/apt-1",
      expect.any(Object),
    );
  });
});
