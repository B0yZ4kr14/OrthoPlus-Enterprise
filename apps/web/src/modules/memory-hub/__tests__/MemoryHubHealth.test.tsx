import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryHubHealth } from "../components/MemoryHubHealth";
import { apiClient } from "../../../lib/api/apiClient";
import { TestWrapper } from "./test-utils";

describe("MemoryHubHealth", () => {
  beforeEach(() => {
    vi.spyOn(apiClient, "get").mockReset();
  });

  it("displays loading state initially", () => {
    vi.spyOn(apiClient, "get").mockReturnValue(new Promise(() => {}));
    render(
      <TestWrapper>
        <MemoryHubHealth />
      </TestWrapper>,
    );
    expect(screen.getByTestId("health-loading")).toBeTruthy();
  });

  it("displays health metrics after loading", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      totalDocuments: 150,
      coveragePercent: 87,
      driftCount: 3,
      lastScan: "2026-05-22T00:00:00Z",
    });

    render(
      <TestWrapper>
        <MemoryHubHealth />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("metric-documents")).toBeTruthy();
    });
    expect(screen.getByText("150")).toBeTruthy();
    expect(screen.getByText("87%")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("displays error on API failure", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(
      new Error("Health check failed: 500"),
    );

    render(
      <TestWrapper>
        <MemoryHubHealth />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("health-error")).toBeTruthy();
    });
  });
});
