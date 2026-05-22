import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryHubSearch } from "../components/MemoryHubSearch"

const mockFetch = vi.fn()
global.fetch = mockFetch

describe("MemoryHubSearch", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it("renders search input and button", () => {
    render(<MemoryHubSearch />)
    expect(screen.getByTestId("search-input")).toBeTruthy()
    expect(screen.getByTestId("search-button")).toBeTruthy()
  })

  it("calls API on form submit", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    })

    render(<MemoryHubSearch />)
    const input = screen.getByTestId("search-input")
    const button = screen.getByTestId("search-button")

    fireEvent.change(input, { target: { value: "rate limiting" } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/memory-hub/search",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ query: "rate limiting", filters: undefined }),
        }),
      )
    })
  })

  it("displays search results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: "chunk-1",
            sourcePath: "specs/test.md",
            docType: "spec",
            title: "Test Spec",
            excerpt: "Test content",
            relevanceScore: 0.95,
            headingPath: [],
          },
        ],
      }),
    })

    render(<MemoryHubSearch />)
    const input = screen.getByTestId("search-input")
    const button = screen.getByTestId("search-button")

    fireEvent.change(input, { target: { value: "test" } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId("search-result")).toBeTruthy()
    })
    expect(screen.getByText("Test Spec")).toBeTruthy()
    expect(screen.getByText("spec")).toBeTruthy()
  })

  it("displays error on API failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    render(<MemoryHubSearch />)
    const input = screen.getByTestId("search-input")
    const button = screen.getByTestId("search-button")

    fireEvent.change(input, { target: { value: "test" } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId("search-error")).toBeTruthy()
    })
  })

  it("does not search with empty query", async () => {
    render(<MemoryHubSearch />)
    const button = screen.getByTestId("search-button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
})
