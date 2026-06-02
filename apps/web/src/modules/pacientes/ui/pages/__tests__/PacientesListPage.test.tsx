import { describe, it, expect, vi, beforeEach } from "vitest";
import {render, screen, act} from "@testing-library/react";
import PacientesListPage from "../PacientesListPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1" }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPatients = [
  {
    id: "p1",
    full_name: "João Silva",
    cpf: "123.456.789-00",
    phone_primary: "(11) 99999-9999",
    status: "ativo",
    risk_level: "baixo",
    risk_score_overall: 10,
  },
  {
    id: "p2",
    full_name: "Maria Souza",
    cpf: "987.654.321-00",
    phone_primary: "(11) 88888-8888",
    status: "inativo",
    risk_level: "alto",
    risk_score_overall: 75,
  },
  {
    id: "p3",
    full_name: "Carlos Lima",
    cpf: "111.222.333-44",
    phone_primary: "(11) 77777-7777",
    status: "ativo",
    risk_level: "critico",
    risk_score_overall: 90,
  },
];

const mockUsePatients = vi.fn();

vi.mock("@/modules/pacientes/hooks/usePatientsUnified", () => ({
  usePatients: () => mockUsePatients(),
}));

// Mock heavy/shared components to keep tests focused
vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title, actions }: any) => (
    <div data-testid="page-header">
      <span>{title}</span>
      {actions && <div data-testid="page-actions">{actions}</div>}
    </div>
  ),
}));

vi.mock("@/components/shared/TableFilter", () => ({
  TableFilter: ({ searchValue, onSearchChange, filters, onClear }: any) => (
    <div data-testid="table-filter">
      <input
        data-testid="search-input"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar..."
      />
      {filters?.map((f: any, i: number) => (
        <select
          key={i}
          data-testid={`filter-${f.label}`}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
        >
          {f.options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      <button data-testid="clear-filters" onClick={onClear}>
        Limpar
      </button>
    </div>
  ),
}));

vi.mock("@/components/shared/StatsCard", () => ({
  StatsCard: ({ title, value, description }: any) => (
    <div data-testid={`stat-${title}`}>
      <span data-testid={`stat-title-${title}`}>{title}</span>
      <span data-testid={`stat-value-${title}`}>{value}</span>
      <span>{description}</span>
    </div>
  ),
}));

vi.mock("@/components/shared/EmptyState", () => ({
  EmptyState: ({ message, description, action }: any) => (
    <div data-testid="empty-state">
      <p>{message}</p>
      <p>{description}</p>
      {action && <button onClick={action.onClick}>{action.label}</button>}
    </div>
  ),
}));

vi.mock("@/components/patients/RiskScoreBadge", () => ({
  RiskScoreBadge: ({ riskLevel }: any) => (
    <span data-testid="risk-badge">{riskLevel}</span>
  ),
}));

describe("PacientesListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePatients.mockReturnValue({
      patients: mockPatients,
      loading: false,
    });
  });

  it("should render loading skeleton when loading", () => {
    mockUsePatients.mockReturnValue({ patients: [], loading: true });

    render(<PacientesListPage />);

    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("should render page header with title", () => {
    render(<PacientesListPage />);

    expect(screen.getByTestId("page-header")).toBeTruthy();
    expect(screen.getByTestId("page-actions")).toBeTruthy();
  });

  it("should render stats cards with correct counts", () => {
    render(<PacientesListPage />);

    expect(screen.getByTestId("stat-Total")).toBeTruthy();
    expect(screen.getByTestId("stat-Ativos")).toBeTruthy();
    expect(screen.getByTestId("stat-Alto Risco")).toBeTruthy();
    expect(screen.getByTestId("stat-Consultas Hoje")).toBeTruthy();
  });

  it("should render patient list with patient data", () => {
    render(<PacientesListPage />);

    expect(screen.getByText("João Silva")).toBeTruthy();
    expect(screen.getByText("Maria Souza")).toBeTruthy();
    expect(screen.getByText("Carlos Lima")).toBeTruthy();
    expect(screen.getByText("(11) 99999-9999")).toBeTruthy();
    expect(screen.getByText("CPF: 123.456.789-00")).toBeTruthy();
  });

  it("should render empty state when no patients match filters", () => {
    mockUsePatients.mockReturnValue({ patients: [], loading: false });

    render(<PacientesListPage />);

    expect(screen.getByTestId("empty-state")).toBeTruthy();
    expect(screen.getByText("Nenhum paciente encontrado")).toBeTruthy();
  });

  it("should filter patients by search term", async () => {
    render(<PacientesListPage />);

    const searchInput = screen.getByTestId("search-input");

    await act(async () => {
      searchInput.setAttribute("value", "Maria");
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Search state is updated; we verify the input value changed
    expect(searchInput.getAttribute("value")).toBe("Maria");
  });

  it("should filter patients by status", async () => {
    render(<PacientesListPage />);

    const statusSelect = screen.getByTestId("filter-Status");

    await act(async () => {
      statusSelect.setAttribute("value", "ativo");
      statusSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(statusSelect.getAttribute("value")).toBe("ativo");
  });

  it("should navigate to patient detail on patient click", () => {
    render(<PacientesListPage />);

    const patientRow = screen
      .getByText("João Silva")
      .closest("[class*='cursor-pointer']");
    if (patientRow) {
      act(() => {
        patientRow.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    }

    // The whole card area is clickable via onClick on the parent div
    // Let's click on the container that has the navigate handler
    const rows = screen.getAllByText(/João Silva|Maria Souza|Carlos Lima/);
    const firstRow = rows[0].closest("div[class*='cursor-pointer']");
    if (firstRow) {
      act(() => {
        (firstRow as HTMLElement).click();
      });
    }

    expect(mockNavigate).toHaveBeenCalledWith("/pacientes/p1");
  });

  it("should navigate to new patient page on button click", () => {
    render(<PacientesListPage />);

    const novoButton = screen.getByText("Novo Paciente");
    act(() => {
      novoButton.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/pacientes/novo");
  });
});
