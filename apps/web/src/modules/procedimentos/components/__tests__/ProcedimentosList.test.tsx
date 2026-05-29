import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ProcedimentosList } from "../ProcedimentosList";
import type { Procedimento } from "../../types/procedimento.types";

const mockOnNovo = vi.fn();
const mockOnEditar = vi.fn();
const mockOnVisualizar = vi.fn();
const mockOnExcluir = vi.fn();

let mockProcedimentos: Procedimento[] = [];

vi.mock("@/modules/procedimentos/hooks/useProcedimentosStore", () => ({
  useProcedimentosStore: () => ({
    get procedimentos() {
      return mockProcedimentos;
    },
  }),
}));

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, title, ...props }: any) => (
    <button onClick={onClick} title={title} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("@orthoplus/core-ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <select value={value} onChange={(e) => onValueChange(e.target.value)}>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

vi.mock("@/components/shared/SearchInput", () => ({
  SearchInput: ({ value, onChange, placeholder, className }: any) => (
    <input
      data-testid="search-input"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

vi.mock("@/components/shared/StatusBadge", () => ({
  StatusBadge: ({ status }: any) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

vi.mock("@/components/shared/ActionButtons", () => ({
  ActionButtons: ({ onView, onEdit, onDelete }: any) => (
    <div>
      <button onClick={onView} title="Visualizar">
        Ver
      </button>
      <button onClick={onEdit} title="Editar">
        Edit
      </button>
      <button onClick={onDelete} title="Excluir">
        Del
      </button>
    </div>
  ),
}));

function createMockProcedimentos(): Procedimento[] {
  return [
    {
      id: "p1",
      codigo: "PROC-001",
      nome: "Limpeza e Profilaxia",
      categoria: "Clínica Geral",
      descricao: "Remoção de placa bacteriana e polimento",
      valor: 150,
      duracaoEstimada: 30,
      unidadeTempo: "minutos",
      materiaisNecessarios: "Kit de limpeza",
      status: "Ativo",
      dataCriacao: "2024-01-15",
      dataAtualizacao: "2024-01-15",
    },
    {
      id: "p2",
      codigo: "PROC-002",
      nome: "Tratamento de Canal",
      categoria: "Endodontia",
      descricao: "Remoção da polpa dentária infectada",
      valor: 800,
      duracaoEstimada: 1,
      unidadeTempo: "horas",
      materiaisNecessarios: "Limas endodônticas",
      status: "Ativo",
      dataCriacao: "2024-01-15",
      dataAtualizacao: "2024-01-15",
    },
    {
      id: "p3",
      codigo: "PROC-003",
      nome: "Clareamento Dental",
      categoria: "Estética",
      descricao: "Clareamento profissional dos dentes",
      valor: 600,
      duracaoEstimada: 45,
      unidadeTempo: "minutos",
      materiaisNecessarios: "Gel clareador",
      status: "Inativo",
      dataCriacao: "2024-01-20",
      dataAtualizacao: "2024-01-20",
    },
  ] as Procedimento[];
}

describe("ProcedimentosList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProcedimentos = createMockProcedimentos();
  });

  it("should render list of procedimentos", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    expect(screen.getByText("Limpeza e Profilaxia")).toBeTruthy();
    expect(screen.getByText("Tratamento de Canal")).toBeTruthy();
    expect(screen.getByText("Clareamento Dental")).toBeTruthy();
    expect(screen.getByText("Código: PROC-001")).toBeTruthy();
    expect(screen.getByText("Código: PROC-002")).toBeTruthy();
  });

  it("should render empty state when no procedimentos", () => {
    mockProcedimentos = [];

    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    expect(
      screen.getByText(
        "Nenhum procedimento encontrado com os filtros selecionados.",
      ),
    ).toBeTruthy();
  });

  it("should render results count", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    expect(screen.getByText("Exibindo 3 de 3 procedimento(s)")).toBeTruthy();
  });

  it("should call onNovo when clicking Novo Procedimento", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const addButton = screen.getByText("Novo Procedimento");
    act(() => {
      addButton.click();
    });

    expect(mockOnNovo).toHaveBeenCalledTimes(1);
  });

  it("should call onVisualizar when clicking view button", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const viewButtons = screen.getAllByTitle("Visualizar");
    act(() => {
      viewButtons[0].click();
    });

    expect(mockOnVisualizar).toHaveBeenCalledTimes(1);
    expect(mockOnVisualizar).toHaveBeenCalledWith("p1");
  });

  it("should call onEditar when clicking edit button", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const editButtons = screen.getAllByTitle("Editar");
    act(() => {
      editButtons[1].click();
    });

    expect(mockOnEditar).toHaveBeenCalledTimes(1);
    expect(mockOnEditar).toHaveBeenCalledWith("p2");
  });

  it("should call onExcluir when clicking delete button", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const deleteButtons = screen.getAllByTitle("Excluir");
    act(() => {
      deleteButtons[0].click();
    });

    expect(mockOnExcluir).toHaveBeenCalledTimes(1);
    expect(mockOnExcluir).toHaveBeenCalledWith("p1");
  });

  it("should filter procedimentos by search input", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const searchInput = screen.getByTestId("search-input");

    act(() => {
      fireEvent.change(searchInput, { target: { value: "Canal" } });
    });

    expect(screen.getByText("Exibindo 1 de 3 procedimento(s)")).toBeTruthy();
    expect(screen.getByText("Tratamento de Canal")).toBeTruthy();
    expect(screen.queryByText("Limpeza e Profilaxia")).toBeNull();
  });

  it("should filter procedimentos by search using codigo", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const searchInput = screen.getByTestId("search-input");

    act(() => {
      fireEvent.change(searchInput, { target: { value: "PROC-003" } });
    });

    expect(screen.getByText("Exibindo 1 de 3 procedimento(s)")).toBeTruthy();
    expect(screen.getByText("Clareamento Dental")).toBeTruthy();
  });

  it("should filter procedimentos by categoria", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const selects = screen.getAllByTestId("select");
    const categoriaSelect = selects[0].querySelector(
      "select",
    ) as HTMLSelectElement;

    act(() => {
      fireEvent.change(categoriaSelect, { target: { value: "Endodontia" } });
    });

    expect(screen.getByText("Exibindo 1 de 3 procedimento(s)")).toBeTruthy();
    expect(screen.getByText("Tratamento de Canal")).toBeTruthy();
    expect(screen.queryByText("Limpeza e Profilaxia")).toBeNull();
  });

  it("should filter procedimentos by status", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const selects = screen.getAllByTestId("select");
    const statusSelect = selects[1].querySelector(
      "select",
    ) as HTMLSelectElement;

    act(() => {
      fireEvent.change(statusSelect, { target: { value: "Inativo" } });
    });

    expect(screen.getByText("Exibindo 1 de 3 procedimento(s)")).toBeTruthy();
    expect(screen.getByText("Clareamento Dental")).toBeTruthy();
    expect(screen.queryByText("Limpeza e Profilaxia")).toBeNull();
  });

  it("should show empty state when filter matches nothing", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const searchInput = screen.getByTestId("search-input");

    act(() => {
      fireEvent.change(searchInput, { target: { value: "zzzzzzz" } });
    });

    expect(
      screen.getByText(
        "Nenhum procedimento encontrado com os filtros selecionados.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Exibindo 0 de 3 procedimento(s)")).toBeTruthy();
  });

  it("should combine multiple filters", () => {
    render(
      <ProcedimentosList
        onNovo={mockOnNovo}
        onEditar={mockOnEditar}
        onVisualizar={mockOnVisualizar}
        onExcluir={mockOnExcluir}
      />,
    );

    const searchInput = screen.getByTestId("search-input");
    const selects = screen.getAllByTestId("select");
    const categoriaSelect = selects[0].querySelector(
      "select",
    ) as HTMLSelectElement;

    act(() => {
      fireEvent.change(searchInput, { target: { value: "Limpeza" } });
      fireEvent.change(categoriaSelect, { target: { value: "Clínica Geral" } });
    });

    expect(screen.getByText("Exibindo 1 de 3 procedimento(s)")).toBeTruthy();
    expect(screen.getByText("Limpeza e Profilaxia")).toBeTruthy();
    expect(screen.queryByText("Tratamento de Canal")).toBeNull();
  });
});
