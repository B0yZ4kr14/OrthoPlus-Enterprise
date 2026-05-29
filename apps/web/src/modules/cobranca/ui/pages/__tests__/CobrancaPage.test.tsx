import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const mockUseInadimplencia = vi.fn();

vi.mock("@/modules/cobranca/hooks/useInadimplencia", () => ({
  useInadimplencia: () => mockUseInadimplencia(),
}));

vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title, description }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: any) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <div data-testid="card-title">{children}</div>
  ),
}));

vi.mock("@orthoplus/core-ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-testid={`tabs-content-${value}`} className={className}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tabs-trigger-${value}`}>{children}</button>
  ),
}));

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@orthoplus/core-ui/input", () => ({
  Input: ({ placeholder, ...props }: any) => (
    <input placeholder={placeholder} {...props} />
  ),
}));

vi.mock("lucide-react", () => ({
  CreditCard: () => <span data-testid="icon-credit-card">card</span>,
  AlertCircle: () => <span data-testid="icon-alert-circle">alert</span>,
  CheckCircle: () => <span data-testid="icon-check-circle">check</span>,
  Clock: () => <span data-testid="icon-clock">clock</span>,
  Send: () => <span data-testid="icon-send">send</span>,
  FileText: () => <span data-testid="icon-file-text">file</span>,
  Mail: () => <span data-testid="icon-mail">mail</span>,
  MessageSquare: () => <span data-testid="icon-message-square">message</span>,
  Loader2: () => <span data-testid="icon-loader">loader</span>,
}));

import CobrancaPage from "../CobrancaPage";

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

const mockInadimplentes = [
  {
    id: "cob-1",
    paciente_nome: "Joao Silva",
    status: "PENDENTE",
    dias_atraso: 15,
    valor_pendente: 500,
    email: "joao@email.com",
    telefone: "(11) 98888-7777",
  },
  {
    id: "cob-2",
    paciente_nome: "Maria Souza",
    status: "EM_COBRANCA",
    dias_atraso: 35,
    valor_pendente: 800,
    email: null,
    telefone: "(11) 97777-6666",
  },
];

const mockStats = {
  totalEmAberto: 1300,
  totalVencido: 1300,
  totalAVencer: 0,
  countTotal: 2,
  countVencidos: 2,
  countAVencer: 0,
  taxaRecuperacao: 75,
};

describe("CobrancaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [],
      stats: mockStats,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("icon-loader")).toBeTruthy();
  });

  it("should render page header with correct title and description", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [],
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("page-header")).toBeTruthy();
    expect(screen.getByText("Cobrança e Inadimplência")).toBeTruthy();
    expect(
      screen.getByText(
        "Gestão de cobranças, controle de inadimplência e automação de comunicação",
      ),
    ).toBeTruthy();
  });

  it("should render stats cards with correct data", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: mockInadimplentes,
      stats: {
        ...mockStats,
        totalEmAberto: 5000,
        totalVencido: 3000,
        totalAVencer: 2000,
        countTotal: 5,
        countVencidos: 3,
        countAVencer: 2,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    const cards = screen.getAllByTestId("card");
    expect(cards.length).toBeGreaterThanOrEqual(4);

    expect(screen.getByText("Total em Aberto")).toBeTruthy();
    expect(screen.getByText("Vencidas")).toBeTruthy();
    expect(screen.getByText("A Vencer")).toBeTruthy();
    expect(screen.getByText("Taxa de Recuperação")).toBeTruthy();
  });

  it("should render tabs with all sections", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [],
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("tabs-trigger-inadimplentes")).toBeTruthy();
    expect(screen.getByTestId("tabs-trigger-comunicacao")).toBeTruthy();
    expect(screen.getByTestId("tabs-trigger-historico")).toBeTruthy();
  });

  it("should render tab content sections", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [],
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("tabs-content-inadimplentes")).toBeTruthy();
    expect(screen.getByTestId("tabs-content-comunicacao")).toBeTruthy();
    expect(screen.getByTestId("tabs-content-historico")).toBeTruthy();
  });

  it("should render empty state when no inadimplentes", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [],
      stats: { ...mockStats, countTotal: 0 },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(
      screen.getByText("Nenhum registro de inadimplência encontrado."),
    ).toBeTruthy();
  });

  it("should render list of inadimplentes with data", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: mockInadimplentes,
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Joao Silva")).toBeTruthy();
    expect(screen.getByText("Maria Souza")).toBeTruthy();
    expect(screen.getByText("Status: PENDENTE")).toBeTruthy();
    expect(screen.getByText("Status: EM_COBRANCA")).toBeTruthy();
  });

  it("should render badges for dias de atraso and valor", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: mockInadimplentes,
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    const badges = screen.getAllByTestId("badge");
    expect(badges.length).toBeGreaterThan(0);

    expect(screen.getAllByText(/Vencido há/).length).toBe(2);
    expect(screen.getAllByText(/15 dias/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/35 dias/).length).toBeGreaterThanOrEqual(1);
  });

  it("should render email button when email is present", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: mockInadimplentes,
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(screen.getByText("E-mail")).toBeTruthy();
  });

  it("should render WhatsApp button when telefone is present", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: mockInadimplentes,
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(screen.getAllByText("WhatsApp").length).toBeGreaterThanOrEqual(1);
  });

  it("should render search input and batch action button", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: mockInadimplentes,
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(
      screen.getByPlaceholderText("Buscar por paciente ou CPF..."),
    ).toBeTruthy();
    expect(screen.getByText("Enviar Cobrança em Lote")).toBeTruthy();
  });

  it("should render Ver Fatura buttons for each item", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: mockInadimplentes,
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    const verFaturaButtons = screen.getAllByText("Ver Fatura");
    expect(verFaturaButtons.length).toBe(2);
  });

  it("should render comunicacao tab placeholder", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [],
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Comunicação Automatizada")).toBeTruthy();
    const comunicacaoTab = screen.getByTestId("tabs-content-comunicacao");
    expect(comunicacaoTab.textContent).toMatch(
      /Funcionalidade em desenvolvimento/,
    );
  });

  it("should render historico tab placeholder", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [],
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    expect(
      screen.getAllByText("Histórico de Cobranças").length,
    ).toBeGreaterThanOrEqual(1);
    const historicoTab = screen.getByTestId("tabs-content-historico");
    expect(historicoTab.textContent).toMatch(/Audit log de comunicações/);
  });

  it("should use destructive badge variant when dias_atraso > 30", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [
        {
          ...mockInadimplentes[1],
          dias_atraso: 45,
        },
      ],
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    const badges = screen.getAllByTestId("badge");
    const destructiveBadge = badges.find(
      (b) => b.getAttribute("data-variant") === "destructive",
    );
    expect(destructiveBadge).toBeTruthy();
  });

  it("should use warning badge variant when dias_atraso <= 30", () => {
    mockUseInadimplencia.mockReturnValue({
      inadimplentes: [
        {
          ...mockInadimplentes[0],
          dias_atraso: 15,
        },
      ],
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<CobrancaPage />, { wrapper: createWrapper() });

    const badges = screen.getAllByTestId("badge");
    const warningBadge = badges.find(
      (b) => b.getAttribute("data-variant") === "warning",
    );
    expect(warningBadge).toBeTruthy();
  });
});
