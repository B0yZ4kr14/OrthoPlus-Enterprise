import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryHubSearch } from "../components/MemoryHubSearch"
import { apiClient } from "../../../lib/api/apiClient"
import { TestWrapper } from "./test-utils"

describe("MemoryHubSearch", () => {
  beforeEach(() => {
    vi.spyOn(apiClient, "post").mockReset()
  })

  it("renders search input and button", () => {
    render(
      <TestWrapper>
        <MemoryHubSearch />
      </TestWrapper>,
    )
    expect(screen.getByTestId("search-input")).toBeTruthy()
    expect(screen.getByTestId("search-button")).toBeTruthy()
  })

  it("calls API on form submit", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      results: [],
      total: 0,
    })

    render(
      <TestWrapper>
        <MemoryHubSearch />
      </TestWrapper>,
    )
    const input = screen.getByTestId("search-input")
    const button = screen.getByTestId("search-button")

    fireEvent.change(input, { target: { value: "rate limiting" } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/memory-hub/search", {
        query: "rate limiting",
        filters: undefined,
      })
    })
  })

  it("displays search results", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
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
      total: 1,
    })

    render(
      <TestWrapper>
        <MemoryHubSearch />
      </TestWrapper>,
    )
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
    vi.spyOn(apiClient, "post").mockRejectedValueOnce(
      new Error("Search failed: 500"),
    )

    render(
      <TestWrapper>
        <MemoryHubSearch />
      </TestWrapper>,
    )
    const input = screen.getByTestId("search-input")
    const button = screen.getByTestId("search-button")

    fireEvent.change(input, { target: { value: "test" } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId("search-error")).toBeTruthy()
    })
  })

  it("does not search with empty query", async () => {
    render(
      <TestWrapper>
        <MemoryHubSearch />
      </TestWrapper>,
    )
    const button = screen.getByTestId("search-button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(apiClient.post).not.toHaveBeenCalled()
    })
  })
})
