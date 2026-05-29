import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardExecutivoPDV from "../DashboardExecutivoPDV";

const mockGet = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1" }),
}));

vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title, description }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock("@/components/shared/LoadingState", () => ({
  LoadingState: ({ message }: any) => (
    <div data-testid="loading-state">{message}</div>
  ),
}));

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, className, depth, ...props }: any) => (
    <div className={className} data-depth={depth} {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}));

vi.mock("recharts", () => ({
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe("DashboardExecutivoPDV", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockDashboardData = {
    kpis: {
      totalVendas: 50000,
      ticketMedio: 250,
      metasAtingidas: 12,
      transacoesTEF: 150,
      vendedores: 5,
    },
    vendasPorVendedor: [
      { nome: "João Silva", vendas: 15000 },
      { nome: "Maria Souza", vendas: 12000 },
    ],
    metasPorPeriodo: [
      { mes: "Jan", meta: 10000, atingido: 9500 },
      { mes: "Fev", meta: 12000, atingido: 13000 },
    ],
    transacoesPorMetodo: [
      { name: "Dinheiro", value: 50 },
      { name: "Cartão", value: 80 },
    ],
    rankingTop5: [
      {
        vendedor_id: "v1",
        profiles: { full_name: "João Silva" },
        total_vendas: 15000,
      },
      {
        vendedor_id: "v2",
        profiles: { full_name: "Maria Souza" },
        total_vendas: 12000,
      },
    ],
  };

  it("should render loading state initially", () => {
    mockGet.mockImplementation(() => new Promise(() => {}));

    render(<DashboardExecutivoPDV />);

    expect(screen.getByTestId("loading-state")).toBeTruthy();
    expect(screen.getByText("Carregando dashboard executivo...")).toBeTruthy();
  });

  it("should render dashboard with data after loading", async () => {
    mockGet.mockResolvedValueOnce(mockDashboardData);

    render(<DashboardExecutivoPDV />);

    await waitFor(() =>
      expect(screen.queryByTestId("loading-state")).toBeNull(),
    );

    expect(screen.getByText("Dashboard Executivo PDV")).toBeTruthy();
    expect(screen.getByText("Total Vendas")).toBeTruthy();
    expect(screen.getByText("Ticket Médio")).toBeTruthy();
    expect(screen.getByText("Metas Atingidas")).toBeTruthy();
    expect(screen.getByText("Transações TEF")).toBeTruthy();
    expect(screen.getByText("Vendedores Ativos")).toBeTruthy();
  });

  it("should call api with correct endpoint and params", async () => {
    mockGet.mockResolvedValueOnce(mockDashboardData);

    render(<DashboardExecutivoPDV />);

    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    expect(mockGet).toHaveBeenCalledWith("/pdv/dashboard-executivo", {
      params: { clinicId: "clinic-1" },
    });
  });

  it("should render charts sections", async () => {
    mockGet.mockResolvedValueOnce(mockDashboardData);

    render(<DashboardExecutivoPDV />);

    await waitFor(() =>
      expect(screen.queryByTestId("loading-state")).toBeNull(),
    );

    expect(screen.getByText("Vendas por Vendedor")).toBeTruthy();
    expect(screen.getByText("Evolução Metas (6 meses)")).toBeTruthy();
    expect(screen.getByText("Transações TEF por Método")).toBeTruthy();
    expect(screen.getByText("Top 5 Vendedores do Mês")).toBeTruthy();
  });

  it("should render ranking data", async () => {
    mockGet.mockResolvedValueOnce(mockDashboardData);

    render(<DashboardExecutivoPDV />);

    await waitFor(() =>
      expect(screen.queryByTestId("loading-state")).toBeNull(),
    );

    expect(screen.getByText("João Silva")).toBeTruthy();
    expect(screen.getByText("Maria Souza")).toBeTruthy();
  });

  it("should render empty ranking message when no data", async () => {
    mockGet.mockResolvedValueOnce({
      ...mockDashboardData,
      rankingTop5: [],
    });

    render(<DashboardExecutivoPDV />);

    await waitFor(() =>
      expect(screen.queryByTestId("loading-state")).toBeNull(),
    );

    expect(screen.getByText("Nenhum vendedor ranqueado este mês")).toBeTruthy();
  });

  it("should render empty TEF message when no transacoes", async () => {
    mockGet.mockResolvedValueOnce({
      ...mockDashboardData,
      transacoesPorMetodo: [],
    });

    render(<DashboardExecutivoPDV />);

    await waitFor(() =>
      expect(screen.queryByTestId("loading-state")).toBeNull(),
    );

    expect(screen.getByText("Nenhuma transação TEF registrada")).toBeTruthy();
  });

  it("should handle API error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValueOnce(new Error("Network error"));

    render(<DashboardExecutivoPDV />);

    await waitFor(() =>
      expect(screen.queryByTestId("loading-state")).toBeNull(),
    );

    expect(screen.getByText("Dashboard Executivo PDV")).toBeTruthy();
    consoleSpy.mockRestore();
  });
});
