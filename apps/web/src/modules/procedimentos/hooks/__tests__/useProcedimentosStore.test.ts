import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

import { useProcedimentosStore } from "../useProcedimentosStore";

describe("useProcedimentosStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ─────────────────────────────────────────────────────────────
  // Initial state
  // ─────────────────────────────────────────────────────────────

  it("should initialize with mock data when localStorage is empty", async () => {
    const { result } = renderHook(() => useProcedimentosStore());

    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    expect(result.current.procedimentos).toHaveLength(8);
    expect(result.current.procedimentos[0].nome).toBe("Limpeza e Profilaxia");
    expect(result.current.procedimentos[1].nome).toBe("Tratamento de Canal");
  });

  it("should load from localStorage when data exists", async () => {
    const customData = [
      {
        id: "99",
        codigo: "PROC-099",
        nome: "Procedimento Custom",
        categoria: "Clínica Geral",
        descricao: "Descrição do procedimento custom",
        valor: 99.0,
        duracaoEstimada: 15,
        unidadeTempo: "minutos",
        materiaisNecessarios: "Material teste",
        status: "Ativo",
        dataCriacao: "2024-03-01",
        dataAtualizacao: "2024-03-01",
      },
    ];
    localStorage.setItem(
      "ortho-plus-procedimentos",
      JSON.stringify(customData),
    );

    const { result } = renderHook(() => useProcedimentosStore());

    await waitFor(() => expect(result.current.procedimentos).toHaveLength(1));

    expect(result.current.procedimentos[0].nome).toBe("Procedimento Custom");
  });

  // ─────────────────────────────────────────────────────────────
  // adicionarProcedimento
  // ─────────────────────────────────────────────────────────────

  it("should add a procedimento", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    const novoProcedimento = {
      codigo: "PROC-009",
      nome: "Novo Procedimento",
      categoria: "Clínica Geral" as const,
      descricao: "Descrição do novo procedimento odontológico",
      valor: 120.0,
      duracaoEstimada: 20,
      unidadeTempo: "minutos" as const,
      materiaisNecessarios: "Material A, Material B",
      status: "Ativo" as const,
    };

    act(() => {
      result.current.adicionarProcedimento(novoProcedimento);
    });

    expect(result.current.procedimentos).toHaveLength(9);
    const added =
      result.current.procedimentos[result.current.procedimentos.length - 1];
    expect(added.nome).toBe("Novo Procedimento");
    expect(added.codigo).toBe("PROC-009");
    expect(added.id).toBeDefined();
    expect(added.dataCriacao).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────
  // atualizarProcedimento
  // ─────────────────────────────────────────────────────────────

  it("should update a procedimento", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    act(() => {
      result.current.atualizarProcedimento("1", {
        nome: "Limpeza Atualizada",
        valor: 200,
      });
    });

    const updated = result.current.procedimentos.find((p) => p.id === "1");
    expect(updated?.nome).toBe("Limpeza Atualizada");
    expect(updated?.valor).toBe(200);
    expect(updated?.dataAtualizacao).toBeDefined();
  });

  it("should not affect other procedimentos on update", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    const originalNome = result.current.procedimentos.find(
      (p) => p.id === "2",
    )?.nome;

    act(() => {
      result.current.atualizarProcedimento("1", { nome: "Alterado" });
    });

    expect(result.current.procedimentos.find((p) => p.id === "2")?.nome).toBe(
      originalNome,
    );
  });

  // ─────────────────────────────────────────────────────────────
  // excluirProcedimento
  // ─────────────────────────────────────────────────────────────

  it("should delete a procedimento", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    act(() => {
      result.current.excluirProcedimento("1");
    });

    expect(result.current.procedimentos).toHaveLength(7);
    expect(
      result.current.procedimentos.find((p) => p.id === "1"),
    ).toBeUndefined();
  });

  // ─────────────────────────────────────────────────────────────
  // buscarPorId
  // ─────────────────────────────────────────────────────────────

  it("should get a procedimento by id", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    const procedimento = result.current.buscarPorId("1");
    expect(procedimento?.nome).toBe("Limpeza e Profilaxia");

    const notFound = result.current.buscarPorId("999");
    expect(notFound).toBeUndefined();
  });

  // ─────────────────────────────────────────────────────────────
  // buscarPorCategoria
  // ─────────────────────────────────────────────────────────────

  it("should filter procedimentos by categoria", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    const clinicaGeral = result.current.buscarPorCategoria("Clínica Geral");
    expect(clinicaGeral.length).toBeGreaterThanOrEqual(2);
    expect(clinicaGeral.every((p) => p.categoria === "Clínica Geral")).toBe(
      true,
    );

    const endodontia = result.current.buscarPorCategoria("Endodontia");
    expect(endodontia).toHaveLength(1);
    expect(endodontia[0].nome).toBe("Tratamento de Canal");

    const noMatch = result.current.buscarPorCategoria("Inexistente");
    expect(noMatch).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────
  // buscarPorStatus
  // ─────────────────────────────────────────────────────────────

  it("should filter procedimentos by status", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    const ativos = result.current.buscarPorStatus("Ativo");
    expect(ativos.length).toBeGreaterThan(0);
    expect(ativos.every((p) => p.status === "Ativo")).toBe(true);

    // Update one to Inativo
    act(() => {
      result.current.atualizarProcedimento("1", { status: "Inativo" as any });
    });

    const inativos = result.current.buscarPorStatus("Inativo");
    expect(inativos).toHaveLength(1);
    expect(inativos[0].id).toBe("1");
  });

  // ─────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────

  it("should persist changes to localStorage", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    act(() => {
      result.current.excluirProcedimento("1");
    });

    const stored = JSON.parse(
      localStorage.getItem("ortho-plus-procedimentos") || "[]",
    );
    expect(stored).toHaveLength(7);
    expect(stored.find((p: any) => p.id === "1")).toBeUndefined();
  });

  it("should persist added procedimento to localStorage", async () => {
    const { result } = renderHook(() => useProcedimentosStore());
    await waitFor(() =>
      expect(result.current.procedimentos.length).toBeGreaterThan(0),
    );

    act(() => {
      result.current.adicionarProcedimento({
        codigo: "PROC-TEST",
        nome: "Teste LocalStorage",
        categoria: "Clínica Geral",
        descricao: "Descrição do teste",
        valor: 50,
        duracaoEstimada: 10,
        unidadeTempo: "minutos",
        status: "Ativo",
      });
    });

    const stored = JSON.parse(
      localStorage.getItem("ortho-plus-procedimentos") || "[]",
    );
    expect(stored).toHaveLength(9);
    expect(stored.some((p: any) => p.nome === "Teste LocalStorage")).toBe(true);
  });
});
