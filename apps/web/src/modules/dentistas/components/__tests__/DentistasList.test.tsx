import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { DentistasList } from "../DentistasList";
import type { Dentista } from "../../types/dentista.types";

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();
const mockOnView = vi.fn();
const mockOnAdd = vi.fn();

vi.mock("@/modules/dentistas/hooks/useDentistasStore", () => ({
  useDentistasStore: () => ({}),
}));

vi.mock("@orthoplus/core-ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select">
      <select value={value} onChange={(e) => onValueChange(e.target.value)}>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: () => null,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

vi.mock("@orthoplus/core-ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: any) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, onClick }: any) => (
    <button data-testid="alert-action" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button data-testid="alert-cancel" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

function createMockDentistas(): Dentista[] {
  return [
    {
      id: "1",
      nome: "Dr. Carlos Silva",
      cro: "CRO-SP 12345",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
      dataNascimento: "1980-05-15",
      sexo: "M",
      telefone: "(11) 3456-7890",
      celular: "(11) 98765-4321",
      email: "carlos.silva@clinica.com",
      endereco: {
        cep: "01234-567",
        logradouro: "Rua dos Dentistas",
        numero: "100",
        complemento: "Sala 5",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
      },
      especialidades: ["Ortodontia", "Clínico Geral"],
      corCalendario: "#3b82f6",
      diasAtendimento: [1, 2, 3, 4, 5],
      horariosAtendimento: { inicio: "08:00", fim: "18:00" },
      valorConsulta: 250,
      observacoes: "Especialista em ortodontia",
      status: "Ativo",
      createdAt: "2024-01-15T10:30:00",
      updatedAt: "2024-01-15T10:30:00",
    },
    {
      id: "2",
      nome: "Dra. Ana Santos",
      cro: "CRO-SP 54321",
      cpf: "987.654.321-00",
      dataNascimento: "1985-08-22",
      sexo: "F",
      telefone: "(11) 2345-6789",
      celular: "(11) 97654-3210",
      email: "ana.santos@clinica.com",
      endereco: {
        cep: "04567-890",
        logradouro: "Av. Paulista",
        numero: "2000",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
      },
      especialidades: ["Endodontia", "Clínico Geral"],
      corCalendario: "#10b981",
      diasAtendimento: [1, 3, 5],
      horariosAtendimento: { inicio: "09:00", fim: "17:00" },
      valorConsulta: 300,
      status: "Ativo",
      createdAt: "2024-02-10T14:20:00",
      updatedAt: "2024-02-10T14:20:00",
    },
    {
      id: "3",
      nome: "Dr. Pedro Costa",
      cro: "CRO-SP 67890",
      cpf: "456.789.123-00",
      dataNascimento: "1978-11-30",
      sexo: "M",
      telefone: "(11) 3210-9876",
      celular: "(11) 96543-2109",
      email: "pedro.costa@clinica.com",
      endereco: {
        cep: "02345-678",
        logradouro: "Rua das Américas",
        numero: "500",
        bairro: "Jardins",
        cidade: "São Paulo",
        estado: "SP",
      },
      especialidades: ["Implantodontia", "Cirurgia Oral"],
      corCalendario: "#f59e0b",
      diasAtendimento: [2, 4, 6],
      horariosAtendimento: { inicio: "08:00", fim: "16:00" },
      valorConsulta: 400,
      observacoes: "Especialista em implantes",
      status: "Férias",
      createdAt: "2024-03-05T11:00:00",
      updatedAt: "2024-03-05T11:00:00",
    },
  ] as Dentista[];
}

describe("DentistasList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dentistas list with data", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    expect(screen.getByText("Dr. Carlos Silva")).toBeTruthy();
    expect(screen.getByText("Dra. Ana Santos")).toBeTruthy();
    expect(screen.getByText("Dr. Pedro Costa")).toBeTruthy();
    expect(screen.getByText("CRO-SP 12345")).toBeTruthy();
    expect(screen.getByText("3 dentista(s) encontrado(s)")).toBeTruthy();
  });

  it("should render empty state when no dentistas are provided", () => {
    render(
      <DentistasList
        dentistas={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    expect(screen.getByText("Nenhum dentista encontrado")).toBeTruthy();
    expect(screen.getByText("0 dentista(s) encontrado(s)")).toBeTruthy();
  });

  it("should call onAdd when Novo Dentista button is clicked", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const addButton = screen.getByText("Novo Dentista");
    act(() => {
      addButton.click();
    });

    expect(mockOnAdd).toHaveBeenCalled();
  });

  it("should call onView when view button is clicked", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const viewButtons = screen.getAllByTitle("Visualizar");
    act(() => {
      viewButtons[0].click();
    });

    expect(mockOnView).toHaveBeenCalledWith(
      expect.objectContaining({ id: "1", nome: "Dr. Carlos Silva" }),
    );
  });

  it("should call onEdit when edit button is clicked", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const editButtons = screen.getAllByTitle("Editar");
    act(() => {
      editButtons[0].click();
    });

    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: "1", nome: "Dr. Carlos Silva" }),
    );
  });

  it("should show delete confirmation dialog and call onDelete on confirm", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const deleteButtons = screen.getAllByTitle("Excluir");
    act(() => {
      deleteButtons[0].click();
    });

    expect(screen.getByTestId("alert-dialog")).toBeTruthy();
    expect(screen.getByText("Confirmar exclusão")).toBeTruthy();

    const confirmButton = screen.getByTestId("alert-action");
    act(() => {
      confirmButton.click();
    });

    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  it("should filter by search term (nome)", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      "Buscar por nome, CRO, CPF, email...",
    );

    act(() => {
      fireEvent.change(searchInput, { target: { value: "Ana" } });
    });

    expect(screen.getByText("1 dentista(s) encontrado(s)")).toBeTruthy();
    expect(screen.queryByText("Dr. Carlos Silva")).toBeNull();
    expect(screen.getByText("Dra. Ana Santos")).toBeTruthy();
  });

  it("should filter by search term (cro)", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      "Buscar por nome, CRO, CPF, email...",
    );

    act(() => {
      fireEvent.change(searchInput, { target: { value: "67890" } });
    });

    expect(screen.getByText("1 dentista(s) encontrado(s)")).toBeTruthy();
    expect(screen.getByText("Dr. Pedro Costa")).toBeTruthy();
  });

  it("should filter by status", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const selects = screen.getAllByTestId("select");
    const statusSelect = selects[0].querySelector(
      "select",
    ) as HTMLSelectElement;

    act(() => {
      fireEvent.change(statusSelect, { target: { value: "Férias" } });
    });

    expect(screen.getByText("1 dentista(s) encontrado(s)")).toBeTruthy();
    expect(screen.getByText("Dr. Pedro Costa")).toBeTruthy();
    expect(screen.queryByText("Dr. Carlos Silva")).toBeNull();
  });

  it("should filter by especialidade", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const selects = screen.getAllByTestId("select");
    const especialidadeSelect = selects[1].querySelector(
      "select",
    ) as HTMLSelectElement;

    act(() => {
      fireEvent.change(especialidadeSelect, {
        target: { value: "Ortodontia" },
      });
    });

    expect(screen.getByText("1 dentista(s) encontrado(s)")).toBeTruthy();
    expect(screen.getByText("Dr. Carlos Silva")).toBeTruthy();
    expect(screen.queryByText("Dra. Ana Santos")).toBeNull();
  });

  it("should show empty state when filter matches nothing", () => {
    render(
      <DentistasList
        dentistas={createMockDentistas()}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      "Buscar por nome, CRO, CPF, email...",
    );

    act(() => {
      fireEvent.change(searchInput, { target: { value: "zzzzzzz" } });
    });

    expect(screen.getByText("Nenhum dentista encontrado")).toBeTruthy();
    expect(screen.getByText("0 dentista(s) encontrado(s)")).toBeTruthy();
  });
});
