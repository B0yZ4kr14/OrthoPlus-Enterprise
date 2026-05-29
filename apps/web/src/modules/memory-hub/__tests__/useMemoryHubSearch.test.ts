import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMemoryHubSearch } from "../hooks/useMemoryHubSearch";
import { apiClient } from "../../../lib/api/apiClient";
import { TestWrapper } from "./test-utils";

describe("useMemoryHubSearch", () => {
  beforeEach(() => {
    vi.spyOn(apiClient, "post").mockReset();
  });

  it("returns initial state", () => {
    const { result } = renderHook(() => useMemoryHubSearch(), {
      wrapper: TestWrapper,
    });
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets loading while searching", async () => {
    vi.spyOn(apiClient, "post").mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useMemoryHubSearch(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.search("test");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it("returns results on success", async () => {
    const mockResults = [
      {
        id: "1",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test",
        excerpt: "Content",
        relevanceScore: 0.9,
        headingPath: [],
      },
    ];

    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      results: mockResults,
      total: 1,
    });

    const { result } = renderHook(() => useMemoryHubSearch(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.search("test");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.results).toEqual(mockResults);
    expect(result.current.error).toBeNull();
  });

  it("returns error on failure", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValueOnce(
      new Error("Search failed: 500"),
    );

    const { result } = renderHook(() => useMemoryHubSearch(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.search("test");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Search failed: 500");
    expect(result.current.results).toEqual([]);
  });

  it("sends filters in request body", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      results: [],
      total: 0,
    });

    const { result } = renderHook(() => useMemoryHubSearch(), {
      wrapper: TestWrapper,
    });
    const filters = { docTypes: ["spec", "plan"] };

    act(() => {
      result.current.search("test", filters);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiClient.post).toHaveBeenCalledWith("/memory-hub/search", {
      query: "test",
      filters,
    });
  });
});
