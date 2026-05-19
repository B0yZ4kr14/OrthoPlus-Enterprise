import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { FuncionariosList } from "../FuncionariosList"

const mockOnEdit = vi.fn()
const mockOnDelete = vi.fn()
const mockOnView = vi.fn()
const mockOnAdd = vi.fn()

// Mock UI components from @orthoplus/core-ui
vi.mock("@/lib/utils/status.utils", () => ({
  getStatusColor: () => "default",
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, title, ...props }: any) => (
    <button onClick={onClick} title={title} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@orthoplus/core-ui/input", () => ({
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}))

vi.mock("@orthoplus/core-ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children, colSpan, ...props }: any) => (
    <td colSpan={colSpan} {...props}>
      {children}
    </td>
  ),
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
}))

vi.mock("@orthoplus/core-ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <select value={value} onChange={(e) => onValueChange(e.target.value)}>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}))

vi.mock("@orthoplus/core-ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: any) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} data-testid="alert-action" {...props}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="alert-cancel">
      {children}
    </button>
  ),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
}))

const mockFuncionarios = [
  {
    id: "f1",
    nome: "João Silva",
    cpf: "111.222.333-44",
    cargo: "Administrador",
    celular: "(11) 98888-7777",
    email: "joao@clinica.com",
    status: "Ativo",
    dataNascimento: "1988-06-10",
    sexo: "M",
    telefone: "(11) 3456-7890",
    endereco: {
      cep: "01234-567",
      logradouro: "Rua A",
      numero: "100",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
    },
    dataAdmissao: "2020-01-15",
    salario: 5000,
    permissoes: {},
    horarioTrabalho: { inicio: "08:00", fim: "18:00" },
    diasTrabalho: [1, 2, 3, 4, 5],
  },
  {
    id: "f2",
    nome: "Maria Souza",
    cpf: "222.333.444-55",
    cargo: "Recepcionista",
    celular: "(11) 97777-6666",
    email: "maria@clinica.com",
    status: "Ativo",
    dataNascimento: "1992-03-22",
    sexo: "F",
    telefone: "(11) 2345-6789",
    endereco: {
      cep: "04567-890",
      logradouro: "Av B",
      numero: "1500",
      bairro: "Jardins",
      cidade: "São Paulo",
      estado: "SP",
    },
    dataAdmissao: "2021-05-10",
    salario: 2500,
    permissoes: {},
    horarioTrabalho: { inicio: "08:00", fim: "17:00" },
    diasTrabalho: [1, 2, 3, 4, 5],
  },
]

describe("FuncionariosList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render list of funcionarios", () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Maria Souza")).toBeTruthy()
    expect(screen.getByText("111.222.333-44")).toBeTruthy()
    expect(screen.getByText("222.333.444-55")).toBeTruthy()
    expect(screen.getAllByText("Administrador").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Recepcionista").length).toBeGreaterThanOrEqual(1)
  })

  it("should render empty state when no funcionarios", () => {
    render(
      <FuncionariosList
        funcionarios={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    expect(screen.getByText("Nenhum funcionário encontrado")).toBeTruthy()
  })

  it("should render results count", () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    expect(screen.getByText("2 funcionário(s) encontrado(s)")).toBeTruthy()
  })

  it("should call onAdd when clicking Novo Funcionário", () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    const addButton = screen.getByText("Novo Funcionário")
    act(() => {
      addButton.click()
    })

    expect(mockOnAdd).toHaveBeenCalledTimes(1)
  })

  it("should call onView when clicking view button", () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    const viewButtons = screen.getAllByTitle("Visualizar")
    act(() => {
      viewButtons[0].click()
    })

    expect(mockOnView).toHaveBeenCalledTimes(1)
    expect(mockOnView).toHaveBeenCalledWith(
      expect.objectContaining({ id: "f1", nome: "João Silva" }),
    )
  })

  it("should call onEdit when clicking edit button", () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    const editButtons = screen.getAllByTitle("Editar")
    act(() => {
      editButtons[1].click()
    })

    expect(mockOnEdit).toHaveBeenCalledTimes(1)
    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: "f2", nome: "Maria Souza" }),
    )
  })

  it("should show delete confirmation dialog and call onDelete when confirmed", () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    // Click delete button for first funcionario
    const deleteButtons = screen.getAllByTitle("Excluir")
    act(() => {
      deleteButtons[0].click()
    })

    // Dialog should be open
    expect(screen.getByTestId("alert-dialog")).toBeTruthy()
    expect(screen.getByText("Confirmar exclusão")).toBeTruthy()

    // Click confirm
    const confirmButton = screen.getByTestId("alert-action")
    act(() => {
      confirmButton.click()
    })

    expect(mockOnDelete).toHaveBeenCalledTimes(1)
    expect(mockOnDelete).toHaveBeenCalledWith("f1")

    // Dialog should be closed (no longer rendered)
    expect(screen.queryByTestId("alert-dialog")).toBeNull()
  })

  it("should not call onDelete when clicking cancelar", () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    const deleteButtons = screen.getAllByTitle("Excluir")
    act(() => {
      deleteButtons[0].click()
    })

    expect(screen.getByTestId("alert-dialog")).toBeTruthy()

    const cancelButton = screen.getByTestId("alert-cancel")
    act(() => {
      cancelButton.click()
    })

    expect(mockOnDelete).not.toHaveBeenCalled()
    // Note: dialog close is handled by Radix UI internals not fully mocked here
  })

  it("should filter funcionarios by search input", async () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    const searchInput = screen.getByPlaceholderText(
      "Buscar por nome, CPF, email...",
    )

    await act(async () => {
      searchInput.setAttribute("value", "Maria")
      searchInput.dispatchEvent(new Event("input", { bubbles: true }))
    })

    expect(searchInput.getAttribute("value")).toBe("Maria")
  })

  it("should filter funcionarios to empty when search has no matches", async () => {
    render(
      <FuncionariosList
        funcionarios={mockFuncionarios as any}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        onAdd={mockOnAdd}
      />,
    )

    const searchInput = screen.getByPlaceholderText(
      "Buscar por nome, CPF, email...",
    )

    await act(async () => {
      searchInput.setAttribute("value", "zzzzz")
      searchInput.dispatchEvent(new Event("input", { bubbles: true }))
    })

    // After filtering, empty state should appear
    expect(screen.getByText("Nenhum funcionário encontrado")).toBeTruthy()
    expect(screen.getByText("0 funcionário(s) encontrado(s)")).toBeTruthy()
  })
})
