import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Mock DI services
const mockFindByLeadId = vi.fn();
const mockCreateAtividadeExecute = vi.fn();
const mockConcluirAtividadeExecute = vi.fn();

vi.mock("@/infrastructure/di", () => ({
  useService: vi.fn((key: string) => {
    if (key === "IAtividadeRepository") {
      return { findByLeadId: mockFindByLeadId };
    }
    if (key === "CreateAtividadeUseCase") {
      return { execute: mockCreateAtividadeExecute };
    }
    if (key === "ConcluirAtividadeUseCase") {
      return { execute: mockConcluirAtividadeExecute };
    }
    return {};
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useAtividades } from "../useAtividades";

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

const mockAtividade = {
  id: "ativ-1",
  leadId: "lead-1",
  clinicId: "clinic-1",
  tipo: "LIGACAO" as const,
  titulo: "Ligar para lead",
  descricao: "Primeiro contato",
  dataAgendada: new Date("2024-01-15T10:00:00"),
  status: "AGENDADA" as const,
  responsavelId: "user-1",
  createdAt: new Date("2024-01-10"),
  updatedAt: new Date("2024-01-10"),
};

const mockAtividade2 = {
  ...mockAtividade,
  id: "ativ-2",
  tipo: "EMAIL" as const,
  titulo: "Enviar proposta",
  status: "CONCLUIDA" as const,
};

describe("useAtividades", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindByLeadId.mockReset();
    mockCreateAtividadeExecute.mockReset();
    mockConcluirAtividadeExecute.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch atividades", async () => {
    mockFindByLeadId.mockResolvedValueOnce([mockAtividade, mockAtividade2]);

    const { result } = renderHook(() => useAtividades("lead-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.atividades).toHaveLength(2);
    expect(result.current.atividades[0].titulo).toBe("Ligar para lead");
    expect(result.current.atividades[1].titulo).toBe("Enviar proposta");
    expect(mockFindByLeadId).toHaveBeenCalledWith("lead-1");
  });

  it("should return empty array when no leadId is provided", async () => {
    const { result } = renderHook(() => useAtividades(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.atividades).toHaveLength(0);
    expect(mockFindByLeadId).not.toHaveBeenCalled();
  });

  it("should show error state when fetching fails", async () => {
    mockFindByLeadId.mockRejectedValueOnce(
      new Error("Erro ao buscar atividades"),
    );

    const { result } = renderHook(() => useAtividades("lead-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────
  // Create activity
  // ─────────────────────────────────────────────────────────────

  it("should create an atividade", async () => {
    mockFindByLeadId.mockResolvedValueOnce([]);
    mockCreateAtividadeExecute.mockResolvedValueOnce(mockAtividade);

    const { result } = renderHook(() => useAtividades("lead-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.createAtividade({
        leadId: "lead-1",
        clinicId: "clinic-1",
        tipo: "LIGACAO",
        titulo: "Ligar para lead",
        descricao: "Primeiro contato",
        dataAgendada: new Date("2024-01-15T10:00:00"),
        responsavelId: "user-1",
      });
    });

    await waitFor(() => expect(result.current.isCreating).toBe(false));

    expect(mockCreateAtividadeExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead-1",
        clinicId: "clinic-1",
        tipo: "LIGACAO",
        titulo: "Ligar para lead",
        descricao: "Primeiro contato",
        responsavelId: "user-1",
      }),
    );
  });

  it("should show error when creating atividade fails", async () => {
    mockFindByLeadId.mockResolvedValueOnce([]);
    mockCreateAtividadeExecute.mockRejectedValueOnce(
      new Error("Erro ao criar"),
    );

    const { result } = renderHook(() => useAtividades("lead-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.createAtividade({
        leadId: "lead-1",
        clinicId: "clinic-1",
        tipo: "EMAIL",
        titulo: "Enviar email",
        responsavelId: "user-1",
      });
    });

    await waitFor(() => expect(result.current.isCreating).toBe(false));
    expect(mockCreateAtividadeExecute).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // Conclude activity
  // ─────────────────────────────────────────────────────────────

  it("should conclude an atividade", async () => {
    mockFindByLeadId.mockResolvedValueOnce([mockAtividade]);
    mockConcluirAtividadeExecute.mockResolvedValueOnce({
      ...mockAtividade,
      status: "CONCLUIDA",
    });

    const { result } = renderHook(() => useAtividades("lead-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.concluirAtividade({
        atividadeId: "ativ-1",
        resultado: "Lead interessado",
      });
    });

    await waitFor(() => expect(result.current.isConcluindo).toBe(false));

    expect(mockConcluirAtividadeExecute).toHaveBeenCalledWith({
      atividadeId: "ativ-1",
      resultado: "Lead interessado",
    });
  });

  it("should conclude an atividade without resultado", async () => {
    mockFindByLeadId.mockResolvedValueOnce([mockAtividade]);
    mockConcluirAtividadeExecute.mockResolvedValueOnce({
      ...mockAtividade,
      status: "CONCLUIDA",
    });

    const { result } = renderHook(() => useAtividades("lead-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.concluirAtividade({
        atividadeId: "ativ-1",
      });
    });

    await waitFor(() => expect(result.current.isConcluindo).toBe(false));

    expect(mockConcluirAtividadeExecute).toHaveBeenCalledWith({
      atividadeId: "ativ-1",
      resultado: undefined,
    });
  });

  it("should show error when concluding atividade fails", async () => {
    mockFindByLeadId.mockResolvedValueOnce([mockAtividade]);
    mockConcluirAtividadeExecute.mockRejectedValueOnce(
      new Error("Erro ao concluir"),
    );

    const { result } = renderHook(() => useAtividades("lead-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.concluirAtividade({
        atividadeId: "ativ-1",
        resultado: "Lead interessado",
      });
    });

    await waitFor(() => expect(result.current.isConcluindo).toBe(false));
    expect(mockConcluirAtividadeExecute).toHaveBeenCalled();
  });
});
