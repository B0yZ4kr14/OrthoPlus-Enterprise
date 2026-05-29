import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1" }),
}));

import NFesPage from "../NFesPage";

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

const mockData = {
  nfes: [
    {
      id: "n1",
      clinic_id: "clinic-1",
      tipo_nota: "NFE",
      numero: 123,
      serie: 1,
      chave_acesso: "test-nfe-001",
      valor_total: 10000,
      status: "AUTORIZADA",
      data_emissao: "2026-05-27T00:00:00Z",
      created_at: "2026-05-27T00:00:00Z",
      updated_at: "2026-05-27T00:00:00Z",
    },
    {
      id: "n2",
      clinic_id: "clinic-1",
      tipo_nota: "NFCE",
      numero: 456,
      serie: 1,
      chave_acesso: "test-nfce-002",
      valor_total: 5000,
      status: "PENDENTE",
      data_emissao: "2026-05-26T00:00:00Z",
      created_at: "2026-05-26T00:00:00Z",
      updated_at: "2026-05-26T00:00:00Z",
    },
  ],
};

describe("NFesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call api with correct endpoint", async () => {
    mockGet.mockResolvedValueOnce(mockData);

    render(<NFesPage />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(mockGet).toHaveBeenCalledWith("/faturamento/nfes");
      },
      { timeout: 3000 },
    );
  });

  it("should render nfe list after loading", async () => {
    mockGet.mockResolvedValueOnce(mockData);

    render(<NFesPage />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(screen.queryByText("Notas Fiscais Eletrônicas")).toBeTruthy();
      },
      { timeout: 3000 },
    );

    expect(screen.queryByText("123")).toBeTruthy();
    expect(screen.queryByText("456")).toBeTruthy();
    expect(screen.queryByText("NFE")).toBeTruthy();
    expect(screen.queryByText("NFCE")).toBeTruthy();
  });

  it("should show empty state when no nfes", async () => {
    mockGet.mockResolvedValueOnce({ nfes: [] });

    render(<NFesPage />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(
          screen.queryByText("Nenhuma nota fiscal encontrada"),
        ).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });
});
