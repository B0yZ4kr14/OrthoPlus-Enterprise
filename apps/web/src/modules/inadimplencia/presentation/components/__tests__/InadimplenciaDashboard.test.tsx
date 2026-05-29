import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { InadimplenciaDashboard } from "../InadimplenciaDashboard";

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock("lucide-react", () => ({
  AlertCircle: () => <svg data-testid="icon-alert" />,
  TrendingDown: () => <svg data-testid="icon-trending" />,
  Clock: () => <svg data-testid="icon-clock" />,
  CheckCircle: () => <svg data-testid="icon-check" />,
}));

describe("InadimplenciaDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all stat cards with correct titles and values", () => {
    render(<InadimplenciaDashboard />);

    expect(screen.getByText("Total Inadimplente")).toBeTruthy();
    expect(screen.getByText("R$ 23.450")).toBeTruthy();

    expect(screen.getByText("Contas Vencidas")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();

    expect(screen.getByText("Taxa de Recuperação")).toBeTruthy();
    expect(screen.getByText("67%")).toBeTruthy();

    expect(screen.getByText("Cobranças Resolvidas")).toBeTruthy();
    expect(screen.getByText("28")).toBeTruthy();
  });

  it("should render trend descriptions", () => {
    render(<InadimplenciaDashboard />);

    expect(screen.getByText("-8%")).toBeTruthy();
    expect(screen.getByText("redução este mês")).toBeTruthy();

    expect(screen.getByText("-3")).toBeTruthy();
    expect(screen.getByText("vs. mês anterior")).toBeTruthy();

    expect(screen.getByText("+12%")).toBeTruthy();
    expect(screen.getByText("excelente")).toBeTruthy();

    expect(screen.getByText("+5")).toBeTruthy();
    expect(screen.getByText("este mês")).toBeTruthy();
  });

  it("should render all icons", () => {
    render(<InadimplenciaDashboard />);

    expect(screen.getByTestId("icon-alert")).toBeTruthy();
    expect(screen.getByTestId("icon-clock")).toBeTruthy();
    expect(screen.getByTestId("icon-trending")).toBeTruthy();
    expect(screen.getByTestId("icon-check")).toBeTruthy();
  });
});
