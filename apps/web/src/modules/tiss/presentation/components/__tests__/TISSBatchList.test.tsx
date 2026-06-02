import { describe, it, expect, vi, beforeEach } from "vitest";
import {render, screen} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { TISSBatchList } from "../TISSBatchList";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1", user: { id: "user-1" } }),
}));

vi.mock("@/lib/utils/status.utils", () => ({
  getStatusColor: (status: string) => status,
}));

vi.mock("@/lib/utils/date.utils", () => ({
  formatDate: (date: string) => date,
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
    <div data-testid="card-title">{children}</div>
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
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@orthoplus/core-ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: any) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
}));

const mockGet = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockBatches = [
  {
    id: "1",
    batch_number: "202511001",
    insurance_company: "Unimed",
    total_guides: 45,
    total_amount: 1875000,
    status: "enviado",
    created_at: "2025-11-10",
  },
  {
    id: "2",
    batch_number: "202511002",
    insurance_company: "Bradesco Saúde",
    total_guides: 32,
    total_amount: 1420000,
    status: "processando",
    created_at: "2025-11-12",
  },
  {
    id: "3",
    batch_number: "202511003",
    insurance_company: "Amil",
    total_guides: 28,
    total_amount: 1245000,
    status: "pendente",
    created_at: "2025-11-15",
  },
];

describe("TISSBatchList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/lotes") return Promise.resolve(mockBatches);
      if (url === "/tiss/guias") return Promise.resolve([]);
      return Promise.resolve([]);
    });
  });

  it("should render list title", async () => {
    render(<TISSBatchList />, { wrapper: createWrapper() });
    expect(await screen.findByText(/Lotes TISS/)).toBeTruthy();
  });

  it("should render all batch items", async () => {
    render(<TISSBatchList />, { wrapper: createWrapper() });

    expect(await screen.findByText("Lote 202511001")).toBeTruthy();
    expect(screen.getByText("Lote 202511002")).toBeTruthy();
    expect(screen.getByText("Lote 202511003")).toBeTruthy();
  });

  it("should render batch insurance and guide count", async () => {
    render(<TISSBatchList />, { wrapper: createWrapper() });

    expect(await screen.findByText(/Unimed/)).toBeTruthy();
    expect(screen.getByText(/Bradesco Saúde/)).toBeTruthy();
    expect(screen.getByText(/Amil/)).toBeTruthy();
  });

  it("should render batch values", async () => {
    render(<TISSBatchList />, { wrapper: createWrapper() });

    const values = await screen.findAllByText(/R\$/);
    expect(values.length).toBe(3);
  });

  it("should render status badges", async () => {
    render(<TISSBatchList />, { wrapper: createWrapper() });

    const badges = await screen.findAllByTestId("badge");
    expect(badges.length).toBe(3);
    expect(badges[0].textContent).toBe("enviado");
    expect(badges[1].textContent).toBe("processando");
    expect(badges[2].textContent).toBe("pendente");
  });

  it("should render details buttons", async () => {
    render(<TISSBatchList />, { wrapper: createWrapper() });

    const buttons = await screen.findAllByText("Detalhes");
    expect(buttons).toHaveLength(3);
  });
});
