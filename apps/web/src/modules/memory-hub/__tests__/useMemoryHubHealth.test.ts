import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useMemoryHubHealth } from "../hooks/useMemoryHubHealth"

const mockFetch = vi.fn()
global.fetch = mockFetch

describe("useMemoryHubHealth", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it("fetches health metrics on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalDocuments: 100,
        coveragePercent: 75,
        driftCount: 2,
        lastScan: "2026-05-22T00:00:00Z",
      }),
    })

    const { result } = renderHook(() => useMemoryHubHealth())

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull()
    })

    expect(result.current.metrics?.totalDocuments).toBe(100)
    expect(result.current.metrics?.coveragePercent).toBe(75)
    expect(result.current.metrics?.driftCount).toBe(2)
  })

  it("handles API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useMemoryHubHealth())

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    expect(result.current.error).toBe("Health check failed: 500")
    expect(result.current.metrics).toBeNull()
  })

  it("refreshes metrics on demand", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalDocuments: 100,
        coveragePercent: 75,
        driftCount: 2,
        lastScan: "2026-05-22T00:00:00Z",
      }),
    })

    const { result } = renderHook(() => useMemoryHubHealth())

    await waitFor(() => {
      expect(result.current.metrics).not.toBeNull()
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalDocuments: 200,
        coveragePercent: 90,
        driftCount: 0,
        lastScan: "2026-05-22T01:00:00Z",
      }),
    })

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.metrics?.totalDocuments).toBe(200)
    expect(result.current.metrics?.coveragePercent).toBe(90)
  })
})
