import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LGPDRequests } from "../LGPDRequests";

vi.mock("@/lib/utils/status.utils", () => ({
  getStatusColor: () => "default",
}));

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
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
  Button: ({ children, size }: any) => (
    <button data-testid="button" data-size={size}>
      {children}
    </button>
  ),
}));

describe("LGPDRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render card title", () => {
    render(<LGPDRequests />);
    expect(screen.getByTestId("card-title").textContent).toBe(
      "Solicitações LGPD",
    );
  });

  it("should render all request items", () => {
    render(<LGPDRequests />);

    expect(screen.getByText("Acesso aos Dados")).toBeTruthy();
    expect(screen.getByText("Exclusão de Dados")).toBeTruthy();
    expect(screen.getByText("Portabilidade")).toBeTruthy();
  });

  it("should render patient names and dates", () => {
    render(<LGPDRequests />);

    expect(
      screen.getByText((content) => content.includes("João Silva")),
    ).toBeTruthy();
    expect(
      screen.getByText((content) => content.includes("Maria Santos")),
    ).toBeTruthy();
    expect(
      screen.getByText((content) => content.includes("Pedro Costa")),
    ).toBeTruthy();
  });

  it("should render status badges", () => {
    render(<LGPDRequests />);

    const badges = screen.getAllByTestId("badge");
    expect(badges.length).toBe(3);
    expect(badges[0].textContent).toBe("pendente");
    expect(badges[1].textContent).toBe("em_analise");
    expect(badges[2].textContent).toBe("concluida");
  });

  it("should render deadline info", () => {
    render(<LGPDRequests />);

    expect(screen.getByText(/Prazo: 2025-11-30/)).toBeTruthy();
    expect(screen.getByText(/Prazo: 2025-11-29/)).toBeTruthy();
    expect(screen.getByText(/Prazo: 2025-11-28/)).toBeTruthy();
  });

  it("should render process buttons", () => {
    render(<LGPDRequests />);

    const buttons = screen.getAllByTestId("button");
    expect(buttons.length).toBe(3);
    buttons.forEach((btn) => {
      expect(btn.textContent).toBe("Processar");
    });
  });
});
