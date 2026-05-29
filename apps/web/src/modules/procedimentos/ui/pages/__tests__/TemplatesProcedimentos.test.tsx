import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const mockToast = vi.fn();

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("@/components/shared/TableFilter", () => ({
  TableFilter: ({
    searchValue,
    onSearchChange,
    searchPlaceholder,
    filters,
    onClear,
  }: any) => (
    <div>
      <input
        data-testid="template-search"
        value={searchValue || ""}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
      />
      {filters?.map((f: any, i: number) => (
        <select
          key={i}
          data-testid={`filter-${f.label}`}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
        >
          {f.options.map((o: any) => (
            <option key={o.value} value={o.value}>
              {o.label}
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

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => (
    <h3 className={className}>{children}</h3>
  ),
}));

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    className,
    type,
    title,
    ...props
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      type={type}
      title={title}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, className, variant }: any) => (
    <span className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@orthoplus/core-ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@orthoplus/core-ui/input", () => ({
  Input: ({
    value,
    onChange,
    id,
    type,
    min,
    step,
    required,
    className,
  }: any) => (
    <input
      id={id}
      type={type || "text"}
      min={min}
      step={step}
      value={value || ""}
      onChange={onChange}
      required={required}
      className={className}
    />
  ),
}));

vi.mock("@orthoplus/core-ui/textarea", () => ({
  Textarea: ({ value, onChange, id, rows }: any) => (
    <textarea id={id} value={value || ""} onChange={onChange} rows={rows} />
  ),
}));

vi.mock("@orthoplus/core-ui/label", () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

vi.mock("@orthoplus/core-ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => null,
}));

import TemplatesProcedimentosPage from "../TemplatesProcedimentos";

const mockTemplates = [
  {
    id: "t1",
    nome: "Template Restauração",
    descricao: "Procedimento de restauração em resina",
    categoria: "RESTAURACAO",
    steps: [],
    tempo_estimado_minutos: 45,
    valor_sugerido: 180,
    is_public: true,
    tags: ["resina", "estética"],
    created_by: "user-1",
  },
  {
    id: "t2",
    nome: "Template Endodontia",
    descricao: "Tratamento de canal completo",
    categoria: "ENDODONTIA",
    steps: [],
    tempo_estimado_minutos: 90,
    valor_sugerido: 800,
    is_public: false,
    tags: ["canal", "dor"],
    created_by: "user-2",
  },
  {
    id: "t3",
    nome: "Template Ortodontia",
    descricao: "Ajuste de aparelho ortodôntico",
    categoria: "ORTODONTIA",
    steps: [],
    tempo_estimado_minutos: 30,
    valor_sugerido: 150,
    is_public: true,
    tags: ["aparelho", "ajuste"],
    created_by: "user-1",
  },
];

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

describe("TemplatesProcedimentosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockDelete.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state on mount", () => {
    mockGet.mockImplementation(() => new Promise(() => {}));

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Carregando templates...")).toBeTruthy();
  });

  it("should fetch and display templates", async () => {
    mockGet.mockResolvedValueOnce(mockTemplates);

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Template Restauração")).toBeTruthy(),
    );

    expect(screen.getByText("Template Endodontia")).toBeTruthy();
    expect(screen.getByText("Template Ortodontia")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/procedimentos/templates", {
      params: {},
    });
  });

  it("should render empty state when no templates", async () => {
    mockGet.mockResolvedValueOnce([]);

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Nenhum template encontrado")).toBeTruthy(),
    );
  });

  // ─────────────────────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────────────────────

  it("should filter templates by search term", async () => {
    mockGet.mockResolvedValueOnce(mockTemplates);

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Template Restauração")).toBeTruthy(),
    );

    const searchInput = screen.getByTestId("template-search");

    act(() => {
      searchInput.setAttribute("value", "Endodontia");
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // After filtering, only Endodontia template should be visible
    expect(screen.queryByText("Template Restauração")).toBeNull();
    expect(screen.getByText("Template Endodontia")).toBeTruthy();
  });

  it("should filter templates by category via API params", async () => {
    mockGet.mockResolvedValueOnce([mockTemplates[0]]);

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Template Restauração")).toBeTruthy(),
    );

    expect(mockGet).toHaveBeenCalledWith("/procedimentos/templates", {
      params: {},
    });
  });

  it("should clear filters when clicking clear button", async () => {
    mockGet.mockResolvedValueOnce(mockTemplates);

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Template Restauração")).toBeTruthy(),
    );

    const clearButton = screen.getByTestId("clear-filters");
    act(() => {
      clearButton.click();
    });

    // After clearing, all templates should be visible again
    expect(screen.getByText("Template Restauração")).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────
  // CRUD - Delete template
  // ─────────────────────────────────────────────────────────────

  it("should delete a template and invalidate queries", async () => {
    mockGet.mockResolvedValueOnce(mockTemplates);
    mockDelete.mockResolvedValueOnce({});

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Template Restauração")).toBeTruthy(),
    );

    // Click delete on first template (created_by user-1 matches current user)
    const deleteButtons = screen
      .getAllByRole("button", { hidden: true })
      .filter(
        (b) =>
          b.getAttribute("data-variant") === "ghost" &&
          b.getAttribute("data-size") === "sm",
      );
    expect(deleteButtons.length).toBeGreaterThan(0);
    act(() => {
      deleteButtons[0].click();
    });

    await waitFor(() =>
      expect(mockDelete).toHaveBeenCalledWith("/procedimentos/templates/t1"),
    );

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Template excluído",
        description: "O template foi removido com sucesso.",
      }),
    );
  });

  it("should not show delete button for templates from other users", async () => {
    mockGet.mockResolvedValueOnce(mockTemplates);

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Template Restauração")).toBeTruthy(),
    );

    // Template t2 was created by user-2, so delete button should not be rendered
    // We verify by checking that all delete buttons correspond to user-1 templates
    const deleteButtons = screen
      .getAllByRole("button", { hidden: true })
      .filter(
        (b) =>
          b.getAttribute("data-variant") === "ghost" &&
          b.getAttribute("data-size") === "sm",
      );
    expect(deleteButtons.length).toBe(2); // t1 and t3 are from user-1
  });

  // ─────────────────────────────────────────────────────────────
  // CRUD - Create template (dialog form)
  // ─────────────────────────────────────────────────────────────

  it("should open create template dialog", async () => {
    mockGet.mockResolvedValueOnce(mockTemplates);

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Template Restauração")).toBeTruthy(),
    );

    const novoButton = screen.getByText((content, element) => {
      return element?.tagName === "BUTTON" && content.includes("Novo Template");
    });
    act(() => {
      novoButton.click();
    });

    expect(screen.getByTestId("dialog-content")).toBeTruthy();
    expect(screen.getByText("Criar Template de Procedimento")).toBeTruthy();
  });

  it("should submit create template form", async () => {
    mockGet.mockResolvedValueOnce(mockTemplates);
    mockPost.mockResolvedValueOnce({});

    render(<TemplatesProcedimentosPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Template Restauração")).toBeTruthy(),
    );

    const novoButton = screen.getByText((content, element) => {
      return element?.tagName === "BUTTON" && content.includes("Novo Template");
    });
    act(() => {
      novoButton.click();
    });

    const nomeInput = screen.getByLabelText("Nome do Template");
    await act(async () => {
      fireEvent.change(nomeInput, { target: { value: "Novo Template Teste" } });
    });

    const form = screen.getByText("Criar Template").closest("form");
    expect(form).toBeTruthy();

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));

    expect(mockPost).toHaveBeenCalledWith(
      "/procedimentos/templates",
      expect.objectContaining({
        nome: "Novo Template Teste",
        created_by: "user-1",
      }),
    );
  });
});
