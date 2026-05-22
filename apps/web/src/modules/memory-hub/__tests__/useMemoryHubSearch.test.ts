import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useMemoryHubSearch } from "../hooks/useMemoryHubSearch"

const mockFetch = vi.fn()
global.fetch = mockFetch

describe("useMemoryHubSearch", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it("returns initial state", () => {
    const { result } = renderHook(() => useMemoryHubSearch())
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("sets loading while searching", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useMemoryHubSearch())

    act(() => {
      result.current.search("test")
    })

    expect(result.current.loading).toBe(true)
  })

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
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    })

    const { result } = renderHook(() => useMemoryHubSearch())

    await act(async () => {
      await result.current.search("test")
    })

    expect(result.current.results).toEqual(mockResults)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("returns error on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useMemoryHubSearch())

    await act(async () => {
      await result.current.search("test")
    })

    expect(result.current.error).toBe("Search failed: 500")
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it("sends filters in request body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    })

    const { result } = renderHook(() => useMemoryHubSearch())
    const filters = { docTypes: ["spec", "plan"] }

    await act(async () => {
      await result.current.search("test", filters)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/memory-hub/search",
      expect.objectContaining({
        body: JSON.stringify({ query: "test", filters }),
      }),
    )
  })
})
