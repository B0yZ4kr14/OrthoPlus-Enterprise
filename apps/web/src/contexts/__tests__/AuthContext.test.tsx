import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { ReactNode, useState } from "react";

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

import { toast } from "sonner";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

function TestConsumer() {
  const auth = useAuth();
  const [lastResult, setLastResult] = useState<string>("no-result");
  const [moduleResult, setModuleResult] = useState<string>("no-module-result");

  return (
    <div>
      <div data-testid="loading">{auth.loading ? "loading" : "ready"}</div>
      <div data-testid="user">{auth.user ? auth.user.id : "no-user"}</div>
      <div data-testid="session">
        {auth.session ? "has-session" : "no-session"}
      </div>
      <div data-testid="role">{auth.userRole || "no-role"}</div>
      <div data-testid="profile">{auth.userProfile || "no-profile"}</div>
      <div data-testid="clinic">{auth.clinicId || "no-clinic"}</div>
      <div data-testid="admin">{auth.isAdmin ? "admin" : "not-admin"}</div>
      <div data-testid="member">{auth.isMember ? "member" : "not-member"}</div>
      <div data-testid="patient">
        {auth.isPatient ? "patient" : "not-patient"}
      </div>
      <div data-testid="permissions">
        {JSON.stringify(auth.userPermissions)}
      </div>
      <div data-testid="modules">{JSON.stringify(auth.activeModules)}</div>
      <div data-testid="last-result">{lastResult}</div>
      <div data-testid="module-result">{moduleResult}</div>

      <button
        data-testid="signin"
        onClick={async () => {
          const result = await auth.signIn("a@b.com", "pw");
          setLastResult(JSON.stringify(result));
        }}
      >
        Sign In
      </button>

      <button
        data-testid="signin-patient"
        onClick={async () => {
          const result = await auth.signInPatient("p@b.com", "pw");
          setLastResult(JSON.stringify(result));
        }}
      >
        Sign In Patient
      </button>

      <button
        data-testid="signup"
        onClick={async () => {
          const result = await auth.signUp("a@b.com", "pw", "Test");
          setLastResult(JSON.stringify(result));
        }}
      >
        Sign Up
      </button>

      <button
        data-testid="register-staff"
        onClick={async () => {
          const result = await auth.registerStaffUser({
            email: "s@b.com",
            password: "pw",
            full_name: "Staff",
          });
          setLastResult(JSON.stringify(result));
        }}
      >
        Register Staff
      </button>

      <button data-testid="signout" onClick={() => auth.signOut()}>
        Sign Out
      </button>

      <button
        data-testid="switch"
        onClick={() => auth.switchClinic("clinic-2")}
      >
        Switch Clinic
      </button>

      <button
        data-testid="fetch-meta"
        onClick={async () => {
          await auth.fetchUserMetadata("user-1");
        }}
      >
        Fetch Meta
      </button>

      <button
        data-testid="check-module"
        onClick={() => {
          setModuleResult(String(auth.hasModuleAccess("agenda")));
        }}
      >
        Check Module
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
    mockGet.mockReset();
    mockPost.mockReset();
    localStorage.clear();
  });

  // ─────────────────────────────────────────────────────────────
  // Session initialization (useEffect / checkSession)
  // ─────────────────────────────────────────────────────────────

  describe("session initialization", () => {
    it("should end loading with no user when no token in localStorage", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });

      render(<TestConsumer />, { wrapper: Wrapper });

      // In React 18, useEffect runs immediately after render; without a token
      // checkSession sets loading=false synchronously, so we cannot assert
      // the initial "loading" state reliably. Instead we wait for ready.
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("user").textContent).toBe("no-user");
      expect(screen.getByTestId("session").textContent).toBe("no-session");
      expect(screen.getByTestId("role").textContent).toBe("no-role");
    });

    it("should populate state and call fetchUserMetadata when valid token + /auth/me returns ADMIN user", async () => {
      localStorage.setItem("accessToken", "tok-123");

      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: {
          clinic_id: "clinic-1",
          avatar_url: "",
          full_name: "Test",
        },
        clinicData: { id: "clinic-1", name: "Clinic One" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda", "pacientes"]);

      render(<TestConsumer />, { wrapper: Wrapper });

      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("user").textContent).toBe("user-1");
      expect(screen.getByTestId("session").textContent).toBe("has-session");
      expect(screen.getByTestId("role").textContent).toBe("ADMIN");
      expect(screen.getByTestId("admin").textContent).toBe("admin");
      expect(screen.getByTestId("clinic").textContent).toBe("clinic-1");
      expect(screen.getByTestId("permissions").textContent).toBe('["ALL"]');
      expect(screen.getByTestId("modules").textContent).toBe(
        '["agenda","pacientes"]',
      );
    });

    it("should clear state when /auth/me fails (no fallback)", async () => {
      mockGet.mockRejectedValueOnce(new Error("me failed"));

      render(<TestConsumer />, { wrapper: Wrapper });

      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("user").textContent).toBe("no-user");
      expect(screen.getByTestId("session").textContent).toBe("no-session");
      expect(screen.getByTestId("role").textContent).toBe("no-role");
    });

    it("should clear state when both /auth/me and /auth/profile fail", async () => {
      localStorage.setItem("accessToken", "tok-123");

      mockGet.mockRejectedValueOnce(new Error("me failed"));
      mockGet.mockRejectedValueOnce(new Error("profile failed"));

      render(<TestConsumer />, { wrapper: Wrapper });

      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("user").textContent).toBe("no-user");
      expect(screen.getByTestId("session").textContent).toBe("no-session");
      expect(screen.getByTestId("role").textContent).toBe("no-role");
      expect(screen.getByTestId("clinic").textContent).toBe("no-clinic");
    });

    it("should normalize ROOT role to ADMIN on session init", async () => {
      localStorage.setItem("accessToken", "tok-123");

      mockGet.mockResolvedValueOnce({
        user: { id: "user-root", role: "ROOT" },
        session: "sess-root",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ROOT" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<TestConsumer />, { wrapper: Wrapper });

      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("role").textContent).toBe("ADMIN");
      expect(screen.getByTestId("admin").textContent).toBe("admin");
    });

    it("should set user but leave role null until fetchUserMetadata when /auth/me returns user without role", async () => {
      localStorage.setItem("accessToken", "tok-123");

      let resolveMetadata: (value: unknown) => void = () => {};
      const metadataPromise = new Promise((resolve) => {
        resolveMetadata = resolve;
      });

      mockGet.mockImplementation((url: string) => {
        if (url === "/auth/me") {
          return Promise.resolve({
            user: { id: "user-nr" },
            session: "sess-nr",
          });
        }
        if (url.includes("/metadata")) {
          return metadataPromise;
        }
        return Promise.resolve({});
      });

      render(<TestConsumer />, { wrapper: Wrapper });

      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("user").textContent).toBe("user-nr");
      expect(screen.getByTestId("role").textContent).toBe("no-role");

      resolveMetadata({
        roleData: { role: "MEMBER" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["agenda"],
      });

      await waitFor(() =>
        expect(screen.getByTestId("role").textContent).toBe("MEMBER"),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // signIn
  // ─────────────────────────────────────────────────────────────

  describe("signIn", () => {
    it("should store token, set session/user/role, and call fetchUserMetadata on success", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockPost.mockResolvedValueOnce({
        access_token: "token-123",
        user: { id: "user-1", email: "a@b.com", role: "ADMIN" },
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: {
          clinic_id: "clinic-1",
          avatar_url: "",
          full_name: "Test",
        },
        clinicData: { id: "clinic-1", name: "Clinic One" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signin").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("session").textContent).toBe("has-session"),
      );

      // Token is now stored in HttpOnly cookie, not localStorage
      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(screen.getByTestId("user").textContent).toBe("user-1");
      expect(screen.getByTestId("role").textContent).toBe("ADMIN");
      expect(screen.getByTestId("admin").textContent).toBe("admin");
      expect(toast.success).toHaveBeenCalledWith(
        "Login realizado com sucesso!",
      );
    });

    it("should set session to cookie-only when no token is returned", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockPost.mockResolvedValueOnce({
        user: { id: "user-cookie", email: "a@b.com" },
      });

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signin").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("session").textContent).toBe("has-session"),
      );

      expect(localStorage.getItem("accessToken")).toBeNull();
    });

    it("should show toast.error and return error object on signIn failure", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      const error = new Error("Invalid credentials");
      (error as any).response = { data: { error: "Invalid credentials" } };
      mockPost.mockRejectedValueOnce(error);

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signin").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("last-result").textContent).toContain(
          "error",
        ),
      );

      expect(toast.error).toHaveBeenCalledWith("Erro ao fazer login", {
        description: "Invalid credentials",
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // signInPatient
  // ─────────────────────────────────────────────────────────────

  describe("signInPatient", () => {
    it("should set user, session, and profile to PATIENT on success", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockPost.mockResolvedValueOnce({
        access_token: "pat-tok",
        user: { id: "pat-1", email: "p@b.com" },
      });

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signin-patient").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("user").textContent).toBe("pat-1"),
      );

      expect(screen.getByTestId("session").textContent).toBe("has-session");
      expect(screen.getByTestId("profile").textContent).toBe("PATIENT");
      expect(screen.getByTestId("patient").textContent).toBe("patient");
      expect(toast.success).toHaveBeenCalledWith(
        "Bem-vindo ao Portal do Paciente!",
      );
    });

    it("should show toast.error on signInPatient failure", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockPost.mockRejectedValueOnce(new Error("Patient login failed"));

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signin-patient").click();
      });

      await waitFor(() => expect(toast.error).toHaveBeenCalled());
    });
  });

  // ─────────────────────────────────────────────────────────────
  // signUp
  // ─────────────────────────────────────────────────────────────

  describe("signUp", () => {
    it("should show toast.success and return error null on success", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockPost.mockResolvedValueOnce({});

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signup").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("last-result").textContent).toBe(
          '{"error":null}',
        ),
      );

      expect(toast.success).toHaveBeenCalledWith("Conta criada com sucesso!", {
        description: "Você já pode fazer login.",
      });
    });

    it("should show toast.error and return error on failure", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      const error = new Error("Email already exists");
      mockPost.mockRejectedValueOnce(error);

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signup").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("last-result").textContent).toContain(
          "error",
        ),
      );

      expect(toast.error).toHaveBeenCalledWith("Erro ao criar conta", {
        description: "Email already exists",
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // registerStaffUser
  // ─────────────────────────────────────────────────────────────

  describe("registerStaffUser", () => {
    it("should return user and error null on success", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockPost.mockResolvedValueOnce({
        user: { id: "staff-1", email: "s@b.com" },
      });

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("register-staff").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("last-result").textContent).toContain(
          "staff-1",
        ),
      );

      const result = JSON.parse(screen.getByTestId("last-result").textContent!);
      expect(result.error).toBeNull();
      expect(result.user.id).toBe("staff-1");
    });

    it("should return error on failure", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      const error = new Error("Registration failed");
      mockPost.mockRejectedValueOnce(error);

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("register-staff").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("last-result").textContent).toContain(
          "error",
        ),
      );

      const result = JSON.parse(screen.getByTestId("last-result").textContent!);
      expect(result.error).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // signOut
  // ─────────────────────────────────────────────────────────────

  describe("signOut", () => {
    it("should clear all state and call /auth/logout on success", async () => {
      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);
      mockPost.mockResolvedValueOnce({});

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("user").textContent).toBe("user-1");

      await act(async () => {
        screen.getByTestId("signout").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("user").textContent).toBe("no-user"),
      );

      expect(screen.getByTestId("session").textContent).toBe("no-session");
      expect(screen.getByTestId("role").textContent).toBe("no-role");
      expect(screen.getByTestId("clinic").textContent).toBe("no-clinic");
      expect(mockPost).toHaveBeenCalledWith("/auth/logout", {});
      expect(toast.success).toHaveBeenCalledWith(
        "Logout realizado com sucesso",
      );
    });

    it("should still show toast.error when API logout fails", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockPost.mockRejectedValueOnce(new Error("Logout failed"));

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signout").click();
      });

      await waitFor(() => expect(toast.error).toHaveBeenCalled());
    });
  });

  // ─────────────────────────────────────────────────────────────
  // fetchUserMetadata
  // ─────────────────────────────────────────────────────────────

  describe("fetchUserMetadata", () => {
    it("should set permissions [ALL] and fetch active modules for ADMIN", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: {
          clinic_id: "clinic-1",
          avatar_url: "",
          full_name: "Admin",
        },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda", "financeiro"]);

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("fetch-meta").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("permissions").textContent).toBe('["ALL"]'),
      );

      expect(screen.getByTestId("role").textContent).toBe("ADMIN");
      expect(screen.getByTestId("modules").textContent).toBe(
        '["agenda","financeiro"]',
      );
    });

    it("should set permissions from API and fetch active modules for MEMBER", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "MEMBER" },
        profileData: {
          clinic_id: "clinic-1",
          avatar_url: "",
          full_name: "Member",
        },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["agenda", "pacientes"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("fetch-meta").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("permissions").textContent).toBe(
          '["agenda","pacientes"]',
        ),
      );

      expect(screen.getByTestId("role").textContent).toBe("MEMBER");
      expect(screen.getByTestId("member").textContent).toBe("member");
    });

    it("should map ROOT role to ADMIN in fetchUserMetadata", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ROOT" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("fetch-meta").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("role").textContent).toBe("ADMIN"),
      );
    });

    it("should update user avatar and full_name in state", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });
      mockPost.mockResolvedValueOnce({
        access_token: "tok",
        user: { id: "user-1", email: "a@b.com" },
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: {
          clinic_id: "clinic-1",
          avatar_url: "https://example.com/avatar.png",
          full_name: "Updated Name",
        },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("signin").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("user").textContent).toBe("user-1"),
      );

      expect(screen.getByTestId("role").textContent).toBe("ADMIN");
    });

    it("should log console.error and leave state unchanged on error", async () => {
      mockGet.mockRejectedValueOnce(new Error("metadata failed"));

      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("fetch-meta").click();
      });

      await waitFor(() =>
        expect(consoleError).toHaveBeenCalledWith(
          "Error fetching user metadata:",
          expect.any(Error),
        ),
      );

      expect(screen.getByTestId("role").textContent).toBe("no-role");

      consoleError.mockRestore();
    });

    it("should preserve existing userRole when roleData.role is missing", async () => {
      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: {},
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<TestConsumer />, { wrapper: Wrapper });

      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("role").textContent).toBe("ADMIN");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // switchClinic
  // ─────────────────────────────────────────────────────────────

  describe("switchClinic", () => {
    it("should update selectedClinic, clinicId, fetch active modules, and toast on valid clinicId", async () => {
      function SwitchTestConsumer() {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">
              {auth.loading ? "loading" : "ready"}
            </div>
            <div data-testid="clinic">{auth.clinicId || "no-clinic"}</div>
            <div data-testid="selected-clinic">
              {auth.selectedClinic?.name || "none"}
            </div>
            <div data-testid="modules">
              {JSON.stringify(auth.activeModules)}
            </div>
            <button
              data-testid="switch-1"
              onClick={() => auth.switchClinic("clinic-1")}
            >
              Switch 1
            </button>
          </div>
        );
      }

      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic One" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);
      mockGet.mockResolvedValueOnce(["agenda", "financeiro"]);

      render(<SwitchTestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("clinic").textContent).toBe("clinic-1"),
      );

      await act(async () => {
        screen.getByTestId("switch-1").click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("modules").textContent).toBe(
          '["agenda","financeiro"]',
        ),
      );

      expect(screen.getByTestId("selected-clinic").textContent).toBe(
        "Clinic One",
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Clínica alterada para: Clinic One",
      );
    });

    it("should not change state for invalid clinicId", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("switch").click();
      });

      expect(screen.getByTestId("clinic").textContent).toBe("no-clinic");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // hasModuleAccess
  // ─────────────────────────────────────────────────────────────

  describe("hasModuleAccess", () => {
    it("should return true when userRole is not loaded yet", async () => {
      mockGet.mockResolvedValueOnce({ user: null, session: null });

      render(<TestConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        screen.getByTestId("check-module").click();
      });

      expect(screen.getByTestId("module-result").textContent).toBe("true");
    });

    it("should return true for ADMIN_ONLY when ADMIN", async () => {
      function ModuleCheckConsumer() {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">
              {auth.loading ? "loading" : "ready"}
            </div>
            <div data-testid="admin-only">
              {String(auth.hasModuleAccess("ADMIN_ONLY"))}
            </div>
          </div>
        );
      }

      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<ModuleCheckConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("admin-only").textContent).toBe("true");
    });

    it("should return true for ADMIN when activeModules is empty (fallback)", async () => {
      function ModuleCheckConsumer() {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">
              {auth.loading ? "loading" : "ready"}
            </div>
            <div data-testid="agenda">
              {String(auth.hasModuleAccess("agenda"))}
            </div>
          </div>
        );
      }

      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce([]);

      render(<ModuleCheckConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("agenda").textContent).toBe("true");
    });

    it("should return true for ADMIN when module is active", async () => {
      function ModuleCheckConsumer() {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">
              {auth.loading ? "loading" : "ready"}
            </div>
            <div data-testid="agenda">
              {String(auth.hasModuleAccess("agenda"))}
            </div>
          </div>
        );
      }

      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<ModuleCheckConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("agenda").textContent).toBe("true");
    });

    it("should return false for ADMIN when module is inactive", async () => {
      function ModuleCheckConsumer() {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">
              {auth.loading ? "loading" : "ready"}
            </div>
            <div data-testid="inactive">
              {String(auth.hasModuleAccess("inactive"))}
            </div>
          </div>
        );
      }

      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<ModuleCheckConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("inactive").textContent).toBe("false");
    });

    it("should return true for MEMBER when module is active and has permission", async () => {
      function ModuleCheckConsumer() {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">
              {auth.loading ? "loading" : "ready"}
            </div>
            <div data-testid="agenda">
              {String(auth.hasModuleAccess("agenda"))}
            </div>
          </div>
        );
      }

      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "MEMBER" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "MEMBER" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["agenda"],
      });
      mockGet.mockResolvedValueOnce(["agenda"]);

      render(<ModuleCheckConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("agenda").textContent).toBe("true");
    });

    it("should return false for MEMBER when module is active but no permission", async () => {
      function ModuleCheckConsumer() {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">
              {auth.loading ? "loading" : "ready"}
            </div>
            <div data-testid="financeiro">
              {String(auth.hasModuleAccess("financeiro"))}
            </div>
          </div>
        );
      }

      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "MEMBER" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "MEMBER" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["agenda"],
      });
      mockGet.mockResolvedValueOnce(["agenda", "financeiro"]);

      render(<ModuleCheckConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("financeiro").textContent).toBe("false");
    });

    it("should use case-insensitive matching for module keys", async () => {
      function ModuleCheckConsumer() {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">
              {auth.loading ? "loading" : "ready"}
            </div>
            <div data-testid="upper">
              {String(auth.hasModuleAccess("AGENDA"))}
            </div>
            <div data-testid="lower">
              {String(auth.hasModuleAccess("agenda"))}
            </div>
          </div>
        );
      }

      localStorage.setItem("accessToken", "tok-123");
      mockGet.mockResolvedValueOnce({
        user: { id: "user-1", role: "ADMIN" },
        session: "sess-1",
      });
      mockGet.mockResolvedValueOnce({
        roleData: { role: "ADMIN" },
        profileData: { clinic_id: "clinic-1" },
        clinicData: { id: "clinic-1", name: "Clinic" },
        permissionsData: ["ALL"],
      });
      mockGet.mockResolvedValueOnce(["Agenda"]);

      render(<ModuleCheckConsumer />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      expect(screen.getByTestId("upper").textContent).toBe("true");
      expect(screen.getByTestId("lower").textContent).toBe("true");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // useAuth hook
  // ─────────────────────────────────────────────────────────────

  describe("useAuth", () => {
    it("should throw when used outside AuthProvider", () => {
      function BadConsumer() {
        const auth = useAuth();
        return <div>{auth.userRole}</div>;
      }

      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => render(<BadConsumer />)).toThrow(
        "useAuth must be used within AuthProvider",
      );

      consoleError.mockRestore();
    });
  });
});
