import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryHubHealth } from "../components/MemoryHubHealth"

const mockFetch = vi.fn()
global.fetch = mockFetch

describe("MemoryHubHealth", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it("displays loading state initially", () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<MemoryHubHealth />)
    expect(screen.getByTestId("health-loading")).toBeTruthy()
  })

  it("displays health metrics after loading", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalDocuments: 150,
        coveragePercent: 87,
        driftCount: 3,
        lastScan: "2026-05-22T00:00:00Z",
      }),
    })

    render(<MemoryHubHealth />)

    await waitFor(() => {
      expect(screen.getByTestId("metric-documents")).toBeTruthy()
    })
    expect(screen.getByText("150")).toBeTruthy()
    expect(screen.getByText("87%")).toBeTruthy()
    expect(screen.getByText("3")).toBeTruthy()
  })

  it("displays error on API failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    render(<MemoryHubHealth />)

    await waitFor(() => {
      expect(screen.getByTestId("health-error")).toBeTruthy()
    })
  })
})
