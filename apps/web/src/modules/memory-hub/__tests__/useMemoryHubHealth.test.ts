import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMemoryHubHealth } from "../hooks/useMemoryHubHealth";
import { apiClient } from "../../../lib/api/apiClient";
import { TestWrapper } from "./test-utils";

describe("useMemoryHubHealth", () => {
  beforeEach(() => {
    vi.spyOn(apiClient, "get").mockReset();
  });

  it("fetches health metrics on mount", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      totalDocuments: 100,
      coveragePercent: 75,
      driftCount: 2,
      lastScan: "2026-05-22T00:00:00Z",
    });

    const { result } = renderHook(() => useMemoryHubHealth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    expect(result.current.metrics?.totalDocuments).toBe(100);
    expect(result.current.metrics?.coveragePercent).toBe(75);
    expect(result.current.metrics?.driftCount).toBe(2);
  });

  it("handles API error", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(
      new Error("Health check failed: 500"),
    );

    const { result } = renderHook(() => useMemoryHubHealth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toBe("Health check failed: 500");
    expect(result.current.metrics).toBeNull();
  });

  it("refreshes metrics on demand", async () => {
    vi.spyOn(apiClient, "get")
      .mockResolvedValueOnce({
        totalDocuments: 100,
        coveragePercent: 75,
        driftCount: 2,
        lastScan: "2026-05-22T00:00:00Z",
      })
      .mockResolvedValueOnce({
        totalDocuments: 200,
        coveragePercent: 90,
        driftCount: 0,
        lastScan: "2026-05-22T01:00:00Z",
      });

    const { result } = renderHook(() => useMemoryHubHealth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull();
    });

    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.metrics?.totalDocuments).toBe(200);
    });

    expect(result.current.metrics?.coveragePercent).toBe(90);
  });
});
