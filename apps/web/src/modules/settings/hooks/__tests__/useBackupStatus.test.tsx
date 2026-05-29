import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Mutable auth state so individual tests can change clinicId
const authState: { clinicId: string | null } = { clinicId: "clinic-1" };

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

import { toast } from "sonner";
import { useBackupStatus } from "../useBackupStatus";

const mockCategoryStatus = {
  category: "clinic",
  lastBackup: "2025-01-01T00:00:00Z",
  lastBackupSize: 1024,
  lastBackupSizeHuman: "1 KB",
  backupCount: 5,
  schemas: ["public"],
};

const mockCategoryStatus2 = {
  category: "analytics",
  lastBackup: null,
  lastBackupSize: null,
  lastBackupSizeHuman: "0 B",
  backupCount: 0,
  schemas: ["analytics"],
};

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

describe("useBackupStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    authState.clinicId = "clinic-1";
  });

  // ─────────────────────────────────────────────────────────────
  // Loading & fetch backup status
  // ─────────────────────────────────────────────────────────────

  it("should load backup categories on mount", async () => {
    mockGet.mockResolvedValueOnce({
      categories: [mockCategoryStatus, mockCategoryStatus2],
    });

    const { result } = renderHook(() => useBackupStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.categories).toHaveLength(2);
    expect(result.current.categories[0].category).toBe("clinic");
    expect(result.current.categories[1].category).toBe("analytics");
    expect(mockGet).toHaveBeenCalledWith("/database_admin/master/backups");
  });

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useBackupStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.categories).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should handle empty categories response", async () => {
    mockGet.mockResolvedValueOnce({ categories: [] });

    const { result } = renderHook(() => useBackupStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.categories).toHaveLength(0);
  });

  it("should handle undefined categories response", async () => {
    mockGet.mockResolvedValueOnce({});

    const { result } = renderHook(() => useBackupStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.categories).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────
  // Trigger backup
  // ─────────────────────────────────────────────────────────────

  it("should trigger backup successfully", async () => {
    mockGet.mockResolvedValueOnce({ categories: [mockCategoryStatus] });
    const backupResult = {
      category: "clinic",
      success: true,
      filePath: "/backups/clinic_2025.sql",
      sizeBytes: 2048,
      sizeHuman: "2 KB",
      durationMs: 1500,
      schemas: ["public"],
    };
    mockPost.mockResolvedValueOnce(backupResult);

    const { result } = renderHook(() => useBackupStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.executeBackup("clinic");
    });

    await waitFor(() => expect(result.current.isExecuting).toBe(false));

    expect(mockPost).toHaveBeenCalledWith(
      "/database_admin/master/backup/clinic",
      { compress: true },
    );
    expect(toast.success).toHaveBeenCalledWith("Backup clinic concluído", {
      description: "Tamanho: 2 KB em 1500ms",
    });
  });

  it("should set isExecuting during backup operation", async () => {
    mockGet.mockResolvedValueOnce({ categories: [mockCategoryStatus] });
    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    mockPost.mockReturnValueOnce(postPromise);

    const { result } = renderHook(() => useBackupStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.executeBackup("clinic");
    });

    await waitFor(() => expect(result.current.isExecuting).toBe(true));

    await act(async () => {
      resolvePost!({
        category: "clinic",
        success: true,
        filePath: "/backups/clinic_2025.sql",
        sizeBytes: 2048,
        sizeHuman: "2 KB",
        durationMs: 1500,
        schemas: ["public"],
      });
      await postPromise;
    });

    await waitFor(() => expect(result.current.isExecuting).toBe(false));
  });

  it("should show toast.error when backup fails", async () => {
    mockGet.mockResolvedValueOnce({ categories: [mockCategoryStatus] });
    const error = new Error("Backup failed");
    mockPost.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBackupStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.executeBackup("clinic");
    });

    await waitFor(() => expect(result.current.isExecuting).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Erro ao executar backup", {
      description: "Backup failed",
    });
  });
});
