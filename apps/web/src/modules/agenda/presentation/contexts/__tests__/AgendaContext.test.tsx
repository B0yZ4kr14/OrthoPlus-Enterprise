import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AgendaProvider, useAgenda } from "../AgendaContext";
import { ReactNode } from "react";

function TestConsumer() {
  const agenda = useAgenda();
  return (
    <div>
      <div data-testid="view-mode">{agenda.viewMode}</div>
      <div data-testid="selected-dentist">
        {agenda.selectedDentistId || "none"}
      </div>
      <div data-testid="week-start">{agenda.weekStart.toISOString()}</div>
      <div data-testid="week-end">{agenda.weekEnd.toISOString()}</div>
      <button data-testid="today" onClick={agenda.goToToday}>
        Today
      </button>
      <button data-testid="next-week" onClick={agenda.goToNextWeek}>
        Next
      </button>
      <button data-testid="prev-week" onClick={agenda.goToPreviousWeek}>
        Prev
      </button>
      <button
        data-testid="set-date"
        onClick={() => agenda.setCurrentDate(new Date("2024-06-15T00:00:00Z"))}
      >
        Set Date
      </button>
      <button data-testid="set-view" onClick={() => agenda.setViewMode("day")}>
        Day View
      </button>
      <button
        data-testid="set-dentist"
        onClick={() => agenda.setSelectedDentistId("dentist-1")}
      >
        Select Dentist
      </button>
    </div>
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return <AgendaProvider>{children}</AgendaProvider>;
}

describe("AgendaContext", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2024-06-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default values", () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    expect(screen.getByTestId("view-mode").textContent).toBe("week");
    expect(screen.getByTestId("selected-dentist").textContent).toBe("none");
  });

  it("should compute week start and end from current date", () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    const weekStart = screen.getByTestId("week-start").textContent!;
    const weekEnd = screen.getByTestId("week-end").textContent!;
    // Both should be valid dates and ~7 days apart
    expect(new Date(weekStart).getTime()).toBeGreaterThan(0);
    expect(new Date(weekEnd).getTime()).toBeGreaterThan(0);
    expect(
      new Date(weekEnd).getTime() - new Date(weekStart).getTime(),
    ).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
  });

  it("should go to today", () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    const before = screen.getByTestId("week-start").textContent!;
    act(() => {
      screen.getByTestId("set-date").click();
    });
    act(() => {
      screen.getByTestId("today").click();
    });
    const after = screen.getByTestId("week-start").textContent!;
    // Should return to approximately the original week
    expect(
      Math.abs(new Date(after).getTime() - new Date(before).getTime()),
    ).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it("should go to next week", () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    const before = new Date(
      screen.getByTestId("week-start").textContent!,
    ).getTime();
    act(() => {
      screen.getByTestId("next-week").click();
    });
    const after = new Date(
      screen.getByTestId("week-start").textContent!,
    ).getTime();
    expect(after - before).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("should go to previous week", () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    const before = new Date(
      screen.getByTestId("week-start").textContent!,
    ).getTime();
    act(() => {
      screen.getByTestId("prev-week").click();
    });
    const after = new Date(
      screen.getByTestId("week-start").textContent!,
    ).getTime();
    expect(before - after).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("should change view mode", () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    act(() => {
      screen.getByTestId("set-view").click();
    });
    expect(screen.getByTestId("view-mode").textContent).toBe("day");
  });

  it("should set selected dentist", () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    act(() => {
      screen.getByTestId("set-dentist").click();
    });
    expect(screen.getByTestId("selected-dentist").textContent).toBe(
      "dentist-1",
    );
  });

  it("should throw when useAgenda is used outside provider", () => {
    function BadConsumer() {
      const agenda = useAgenda();
      return <div>{agenda.viewMode}</div>;
    }

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<BadConsumer />)).toThrow(
      "useAgenda must be used within AgendaProvider",
    );
    consoleError.mockRestore();
  });
});
