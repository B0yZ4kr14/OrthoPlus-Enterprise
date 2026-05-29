import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BIMetrics } from "../BIMetrics";

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("lucide-react", () => ({
  TrendingUp: () => <span data-testid="icon-trending">📈</span>,
  DollarSign: () => <span data-testid="icon-dollar">💵</span>,
  Users: () => <span data-testid="icon-users">👥</span>,
  Calendar: () => <span data-testid="icon-calendar">📅</span>,
}));

describe("BIMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all four metric cards", () => {
    render(<BIMetrics />);

    const cards = screen.getAllByTestId("card");
    expect(cards).toHaveLength(4);
  });

  it("should render metric titles", () => {
    render(<BIMetrics />);

    expect(screen.getByText("Receita Mensal")).toBeTruthy();
    expect(screen.getByText("Novos Pacientes")).toBeTruthy();
    expect(screen.getByText("Taxa de Ocupação")).toBeTruthy();
    expect(screen.getByText("Ticket Médio")).toBeTruthy();
  });

  it("should render metric values", () => {
    render(<BIMetrics />);

    expect(screen.getByText("R$ 185.420")).toBeTruthy();
    expect(screen.getByText("124")).toBeTruthy();
    expect(screen.getByText("87%")).toBeTruthy();
    expect(screen.getByText("R$ 1.485")).toBeTruthy();
  });

  it("should render trend indicators", () => {
    render(<BIMetrics />);

    expect(screen.getByText("+15.3%")).toBeTruthy();
    expect(screen.getByText("+8.2%")).toBeTruthy();
    expect(screen.getByText("+3.5%")).toBeTruthy();
    expect(screen.getByText("+6.8%")).toBeTruthy();
  });

  it("should render descriptions", () => {
    render(<BIMetrics />);

    expect(screen.getByText("vs. mês anterior")).toBeTruthy();
    expect(screen.getByText("este mês")).toBeTruthy();
    expect(screen.getByText("capacidade")).toBeTruthy();
    expect(screen.getByText("por paciente")).toBeTruthy();
  });

  it("should render icons for each metric", () => {
    render(<BIMetrics />);

    expect(screen.getByTestId("icon-dollar")).toBeTruthy();
    expect(screen.getByTestId("icon-users")).toBeTruthy();
    expect(screen.getByTestId("icon-calendar")).toBeTruthy();
    expect(screen.getByTestId("icon-trending")).toBeTruthy();
  });
});
