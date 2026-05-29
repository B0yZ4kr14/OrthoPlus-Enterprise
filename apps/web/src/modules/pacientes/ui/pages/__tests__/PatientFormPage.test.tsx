import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
};

const mockNavigate = vi.fn();
const mockParams: { id?: string } = {};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-hook-form", async () => {
  const actual =
    await vi.importActual<typeof import("react-hook-form")>("react-hook-form");
  return {
    ...actual,
    useForm: () => ({
      ...actual.useForm(),
      handleSubmit: (fn: any) => () =>
        fn({
          full_name: "João Silva",
          birth_date: "1990-01-01",
          phone_primary: "(11) 99999-9999",
          status: "PROSPECT",
          weight_kg: null,
          height_cm: null,
        }),
      watch: () => ({ unsubscribe: () => {} }),
      reset: vi.fn(),
      setValue: vi.fn(),
      formState: { errors: {} },
    }),
  };
});

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => ({}),
}));

const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockGet = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

vi.mock("@/lib/adapters/patientAdapter", () => ({
  PatientAdapter: {
    toFrontend: (data: any) => ({
      full_name: data.fullName,
      cpf: data.cpf,
      birth_date: data.birthDate,
      phone_primary: data.phone,
      status: data.status,
    }),
    toAPI: (data: any) => data,
  },
}));

// Mock heavy form tab components
vi.mock("@/modules/pacientes/ui/components/PatientFormTabs", () => ({
  PatientFormTabs: ({ children }: any) => (
    <div data-testid="form-tabs">{children}</div>
  ),
}));

vi.mock("@/modules/pacientes/ui/tabs/PersonalDataTab", () => ({
  PersonalDataTab: () => <div data-testid="tab-personal">Dados Pessoais</div>,
}));

vi.mock("@/modules/pacientes/ui/tabs/ContactAddressTab", () => ({
  ContactAddressTab: () => <div data-testid="tab-contact">Contato</div>,
}));

vi.mock("@/modules/pacientes/ui/tabs/MedicalHistoryTab", () => ({
  MedicalHistoryTab: () => (
    <div data-testid="tab-medical">Histórico Médico</div>
  ),
}));

vi.mock("@/modules/pacientes/ui/tabs/HabitsMeasuresTab", () => ({
  HabitsMeasuresTab: () => <div data-testid="tab-habits">Hábitos</div>,
}));

vi.mock("@/modules/pacientes/ui/tabs/DentalTab", () => ({
  DentalTab: () => <div data-testid="tab-dental">Odontológico</div>,
}));

vi.mock("@/modules/pacientes/ui/tabs/OtherTab", () => ({
  OtherTab: () => <div data-testid="tab-other">Outros</div>,
}));

vi.mock("@/modules/pacientes/ui/tabs/MarketingTrackingTab", () => ({
  MarketingTrackingTab: () => <div data-testid="tab-marketing">Marketing</div>,
}));

import { toast } from "sonner";
import PatientFormPage from "../PatientFormPage";

describe("PatientFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockReset();
    mockPut.mockReset();
    mockPatch.mockReset();
    mockGet.mockReset();
    mockNavigate.mockReset();
    delete mockParams.id;
    authState.clinicId = "clinic-1";
    authState.user = { id: "user-1" };
  });

  it("should render create mode when no id param", () => {
    render(<PatientFormPage />);

    expect(screen.getByText("Novo Paciente")).toBeTruthy();
    expect(screen.getByText("Salvar")).toBeTruthy();
    expect(screen.getByTestId("form-tabs")).toBeTruthy();
  });

  it("should render edit mode when id param is present", async () => {
    mockParams.id = "patient-1";
    mockGet.mockResolvedValueOnce({
      id: "patient-1",
      fullName: "João Silva",
      cpf: "123.456.789-00",
      birthDate: "1990-01-01",
      phone: "(11) 99999-9999",
      status: "PROSPECT",
    });

    render(<PatientFormPage />);

    await waitFor(() => {
      expect(screen.getByText("Editar Paciente")).toBeTruthy();
    });
  });

  it("should show loading skeleton when fetching patient data in edit mode", () => {
    mockParams.id = "patient-1";
    mockGet.mockImplementationOnce(() => new Promise(() => {}));

    render(<PatientFormPage />);

    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("should navigate back on arrow back button click", () => {
    render(<PatientFormPage />);

    const buttons = screen.getAllByRole("button");
    act(() => {
      buttons[0].click();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/pacientes");
  });

  it("should create a new patient on form submit", async () => {
    mockPost.mockResolvedValueOnce({});

    render(<PatientFormPage />);

    const saveButton = screen.getByText("Salvar");

    await act(async () => {
      saveButton.click();
    });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/pacientes", expect.any(Object));
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Paciente cadastrado com sucesso!",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/pacientes");
  });

  it("should update existing patient on form submit", async () => {
    mockParams.id = "patient-1";
    mockGet.mockResolvedValueOnce({
      id: "patient-1",
      fullName: "João Silva",
      cpf: "123.456.789-00",
      birthDate: "1990-01-01",
      phone: "(11) 99999-9999",
      status: "TRATAMENTO",
    });
    mockPut.mockResolvedValueOnce({});
    mockPatch.mockResolvedValueOnce({});

    render(<PatientFormPage />);

    await waitFor(() => {
      expect(screen.getByText("Editar Paciente")).toBeTruthy();
    });

    const saveButton = screen.getByText("Salvar");

    await act(async () => {
      saveButton.click();
    });

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        "/pacientes/patient-1",
        expect.any(Object),
      );
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Paciente atualizado com sucesso!",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/pacientes");
  });

  it("should show toast.error when user is not authenticated", async () => {
    authState.clinicId = null;
    authState.user = null;

    render(<PatientFormPage />);

    const saveButton = screen.getByText("Salvar");

    await act(async () => {
      saveButton.click();
    });

    expect(toast.error).toHaveBeenCalledWith("Erro", {
      description: "Usuário não autenticado",
    });
  });

  it("should show toast.error on API failure during create", async () => {
    mockPost.mockRejectedValueOnce(new Error("Save failed"));

    render(<PatientFormPage />);

    const saveButton = screen.getByText("Salvar");

    await act(async () => {
      saveButton.click();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao salvar paciente", {
        description: "Save failed",
      });
    });
  });
});
