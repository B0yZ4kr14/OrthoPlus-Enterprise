import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act, cleanup } from "@testing-library/react";
import { useSplit } from "./useSplit";

let mockAuthValue: {
  user: { id: string; role: string } | null;
  selectedClinic: { id: string; name: string } | null;
} = {
  user: { id: "user-1", role: "ADMIN" },
  selectedClinic: { id: "clinic-1", name: "Clinic One" },
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from "sonner";

describe("useSplit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPut.mockReset();
    mockDelete.mockReset();

    mockAuthValue = {
      user: { id: "user-1", role: "ADMIN" },
      selectedClinic: { id: "clinic-1", name: "Clinic One" },
    };
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should start with loading true and empty arrays", async () => {
      mockGet.mockResolvedValue([]);

      const { result } = renderHook(() => useSplit());

      expect(result.current.loading).toBe(true);
      expect(result.current.configs).toEqual([]);
      expect(result.current.transacoes).toEqual([]);
      expect(result.current.comissoes).toEqual([]);
    });
  });

  describe("data fetching", () => {
    it("should fetch configs, transacoes, and comissoes on mount", async () => {
      const configs = [{ id: "cfg-1", percentual_split: 40 }];
      const transacoes = [{ id: "txn-1", status: "CONCLUIDO" }];
      const comissoes = [{ id: "com-1", mes_referencia: "2024-01" }];

      mockGet
        .mockResolvedValueOnce(configs)
        .mockResolvedValueOnce(transacoes)
        .mockResolvedValueOnce(comissoes);

      const { result } = renderHook(() => useSplit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGet).toHaveBeenCalledTimes(3);
      expect(mockGet).toHaveBeenNthCalledWith(1, "/split/config", {
        params: {
          clinic_id: mockAuthValue.selectedClinic,
          sort: "created_at.desc",
        },
      });
      expect(mockGet).toHaveBeenNthCalledWith(2, "/split/transacoes", {
        params: {
          clinic_id: mockAuthValue.selectedClinic,
          sort: "created_at.desc",
        },
      });
      expect(mockGet).toHaveBeenNthCalledWith(3, "/split/comissoes", {
        params: {
          clinic_id: mockAuthValue.selectedClinic,
          sort: "mes_referencia.desc",
        },
      });

      expect(result.current.configs).toEqual(configs);
      expect(result.current.transacoes).toEqual(transacoes);
      expect(result.current.comissoes).toEqual(comissoes);
    });

    it("should not fetch when selectedClinic is null", async () => {
      mockAuthValue.selectedClinic = null;

      const { result } = renderHook(() => useSplit());

      await act(async () => {});

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(true);
    });

    it("should show error toast when fetch fails", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useSplit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(toast.error).toHaveBeenCalledWith(
        "Erro ao carregar dados de split",
      );
    });
  });

  describe("createConfig", () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([]);
    });

    it("should create config and reload data on success", async () => {
      mockPost.mockResolvedValue({});

      const { result } = renderHook(() => useSplit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.createConfig({
          percentual_split: 50,
          dentist_id: "dent-1",
        });
      });

      expect(mockPost).toHaveBeenCalledWith("/split/config", {
        percentual_split: 50,
        dentist_id: "dent-1",
        clinic_id: mockAuthValue.selectedClinic,
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Configuração de split criada com sucesso!",
      );
    });

    it("should show error toast when create fails", async () => {
      mockPost.mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useSplit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.createConfig({ percentual_split: 50 });
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Erro ao criar configuração de split",
      );
    });

    it("should show error toast when user is not authenticated", async () => {
      mockAuthValue.user = null;

      const { result } = renderHook(() => useSplit());

      await act(async () => {
        await result.current.createConfig({ percentual_split: 50 });
      });

      expect(mockPost).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado");
    });

    it("should show error toast when selectedClinic is null", async () => {
      mockAuthValue.selectedClinic = null;

      const { result } = renderHook(() => useSplit());

      await act(async () => {
        await result.current.createConfig({ percentual_split: 50 });
      });

      expect(mockPost).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado");
    });
  });

  describe("updateConfig", () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([]);
    });

    it("should update config and reload data on success", async () => {
      mockPut.mockResolvedValue({});

      const { result } = renderHook(() => useSplit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateConfig("cfg-1", { percentual_split: 60 });
      });

      expect(mockPut).toHaveBeenCalledWith("/split/config/cfg-1", {
        percentual_split: 60,
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Configuração de split atualizada com sucesso!",
      );
    });

    it("should show error toast when update fails", async () => {
      mockPut.mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useSplit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateConfig("cfg-1", { percentual_split: 60 });
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Erro ao atualizar configuração de split",
      );
    });

    it("should show error toast when user is not authenticated", async () => {
      mockAuthValue.user = null;

      const { result } = renderHook(() => useSplit());

      await act(async () => {
        await result.current.updateConfig("cfg-1", { percentual_split: 60 });
      });

      expect(mockPut).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado");
    });
  });

  describe("deleteConfig", () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([]);
    });

    it("should delete config and reload data on success", async () => {
      mockDelete.mockResolvedValue({});

      const { result } = renderHook(() => useSplit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteConfig("cfg-1");
      });

      expect(mockDelete).toHaveBeenCalledWith("/split/config/cfg-1");
      expect(toast.success).toHaveBeenCalledWith(
        "Configuração de split excluída com sucesso!",
      );
    });

    it("should show error toast when delete fails", async () => {
      mockDelete.mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useSplit());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteConfig("cfg-1");
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Erro ao excluir configuração de split",
      );
    });

    it("should show error toast when user is not authenticated", async () => {
      mockAuthValue.user = null;

      const { result } = renderHook(() => useSplit());

      await act(async () => {
        await result.current.deleteConfig("cfg-1");
      });

      expect(mockDelete).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado");
    });
  });
});
