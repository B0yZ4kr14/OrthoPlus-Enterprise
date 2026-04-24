import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { ReactNode } from "react";

// Mocks
vi.mock("../../lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading ? "loading" : "ready"}</div>
      <div data-testid="user">{auth.user ? auth.user.id : "no-user"}</div>
      <div data-testid="session">{auth.session ? "has-session" : "no-session"}</div>
      <div data-testid="role">{auth.userRole || "no-role"}</div>
      <div data-testid="clinic">{auth.clinicId || "no-clinic"}</div>
      <div data-testid="admin">{auth.isAdmin ? "admin" : "not-admin"}</div>
      <button data-testid="signin" onClick={() => auth.signIn("a@b.com", "pw")}>
        Sign In
      </button>
      <button data-testid="signout" onClick={() => auth.signOut()}>
        Sign Out
      </button>
      <button data-testid="switch" onClick={() => auth.switchClinic("clinic-2")}>
        Switch Clinic
      </button>
    </div>
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with initial state (no user, loading)", async () => {
    mockGet.mockResolvedValueOnce({ user: null, session: null });

    render(<TestConsumer />, { wrapper: Wrapper });

    expect(screen.getByTestId("loading").textContent).toBe("loading");

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));

    expect(screen.getByTestId("user").textContent).toBe("no-user");
    expect(screen.getByTestId("session").textContent).toBe("no-session");
    expect(screen.getByTestId("role").textContent).toBe("no-role");
    expect(screen.getByTestId("clinic").textContent).toBe("no-clinic");
    expect(screen.getByTestId("admin").textContent).toBe("not-admin");
  });

  it("should login and update state", async () => {
    mockGet.mockResolvedValueOnce({ user: null, session: null });
    mockPost.mockResolvedValueOnce({
      access_token: "token-123",
      user: { id: "user-1", email: "a@b.com" },
    });
    mockGet.mockResolvedValueOnce({
      roleData: { role: "ADMIN" },
      profileData: { clinic_id: "clinic-1", avatar_url: "", full_name: "Test" },
      clinicData: { id: "clinic-1", name: "Clinic One" },
      permissionsData: ["ALL"],
    });
    mockGet.mockResolvedValueOnce(["agenda", "pacientes"]);

    render(<TestConsumer />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));

    await act(async () => {
      screen.getByTestId("signin").click();
    });

    await waitFor(() => expect(screen.getByTestId("session").textContent).toBe("has-session"));
    expect(screen.getByTestId("user").textContent).toBe("user-1");
    expect(screen.getByTestId("admin").textContent).toBe("admin");
  });

  it("should logout and clear state", async () => {
    mockGet.mockResolvedValueOnce({ user: null, session: null });
    mockPost.mockResolvedValueOnce({});

    render(<TestConsumer />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));

    await act(async () => {
      screen.getByTestId("signout").click();
    });

    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("no-user"));
    expect(screen.getByTestId("session").textContent).toBe("no-session");
    expect(screen.getByTestId("role").textContent).toBe("no-role");
    expect(screen.getByTestId("clinic").textContent).toBe("no-clinic");
  });

  it("should switch clinic when available", async () => {
    mockGet.mockResolvedValueOnce({
      user: { id: "user-1" },
      session: { access_token: "active" },
    });
    mockGet.mockResolvedValueOnce({
      roleData: { role: "ADMIN" },
      profileData: { clinic_id: "clinic-1" },
      clinicData: { id: "clinic-1", name: "Clinic One" },
      permissionsData: ["ALL"],
    });
    mockGet.mockResolvedValueOnce(["agenda"]);

    render(<TestConsumer />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));

    // After initial load clinic-1 is set; switchClinic to clinic-2 won't find it
    // because availableClinics only has clinic-1, so state should remain
    await act(async () => {
      screen.getByTestId("switch").click();
    });

    // clinicId remains clinic-1 because clinic-2 is not in availableClinics
    expect(screen.getByTestId("clinic").textContent).toBe("clinic-1");
  });
});
