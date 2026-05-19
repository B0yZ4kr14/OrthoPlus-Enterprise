import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { AuthContext } from "@/contexts/AuthContext"
import type { AuthContextType } from "@/contexts/AuthContext"
import { ProtectedRoute } from "../ProtectedRoute"
import { ReactNode } from "react"

const mockAuthState: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  userRole: null,
  userProfile: null,
  clinicId: null,
  isAdmin: false,
  isMember: false,
  isPatient: false,
  availableClinics: [],
  selectedClinic: null,
  userPermissions: [],
  activeModules: [],
  switchClinic: vi.fn(),
  hasRole: vi.fn(() => false),
  hasModuleAccess: vi.fn(() => false),
  fetchUserMetadata: vi.fn(),
  signUp: vi.fn(),
  registerStaffUser: vi.fn(),
  signIn: vi.fn(),
  signInPatient: vi.fn(),
  signOut: vi.fn(),
}

function MockAuthProvider({
  children,
  overrides,
}: {
  children: ReactNode
  overrides?: Partial<AuthContextType>
}) {
  const value = { ...mockAuthState, ...overrides }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function renderProtectedRoute(
  authOverrides: Partial<AuthContextType> = {},
  routeProps: {
    requireAdmin?: boolean
    requireStaff?: boolean
    requirePatient?: boolean
    moduleKey?: string
  } = {},
) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/auth" element={<div data-testid="auth-page">Auth</div>} />
        <Route path="/403" element={<div data-testid="forbidden-page">403</div>} />
        <Route
          path="/protected"
          element={
            <MockAuthProvider overrides={authOverrides}>
              <ProtectedRoute {...routeProps}>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            </MockAuthProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("should render spinner while loading", () => {
    const { container } = renderProtectedRoute({ loading: true })

    expect(screen.queryByTestId("protected-content")).toBeNull()
    expect(screen.queryByText("Acesso Negado")).toBeNull()
    expect(container.querySelector("svg")).toBeTruthy()
  })

  it("should redirect to /auth when no user", () => {
    renderProtectedRoute({ user: null })

    expect(screen.getByTestId("auth-page")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })

  it("should render children when authenticated with no restrictions", () => {
    renderProtectedRoute({ user: { id: "user-1" } })

    expect(screen.getByTestId("protected-content")).toBeTruthy()
  })

  it('should show "Acesso Negado" when requireAdmin=true and not admin', () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isAdmin: false },
      { requireAdmin: true },
    )

    expect(screen.getByText("Acesso Negado")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })

  it("should render children when requireAdmin=true and is admin", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isAdmin: true },
      { requireAdmin: true },
    )

    expect(screen.getByTestId("protected-content")).toBeTruthy()
    expect(screen.queryByText("Acesso Negado")).toBeNull()
  })

  it('should show "Acesso Negado" when requireStaff=true and is patient', () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isPatient: true, isMember: false },
      { requireStaff: true },
    )

    expect(screen.getByText("Acesso Negado")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })

  it("should render children when requireStaff=true and is member", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isPatient: false, isMember: true },
      { requireStaff: true },
    )

    expect(screen.getByTestId("protected-content")).toBeTruthy()
    expect(screen.queryByText("Acesso Negado")).toBeNull()
  })

  it('should show "Acesso Negado" when requirePatient=true and not patient', () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isPatient: false },
      { requirePatient: true },
    )

    expect(screen.getByText("Acesso Negado")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })

  it("should render children when requirePatient=true and is patient", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isPatient: true },
      { requirePatient: true },
    )

    expect(screen.getByTestId("protected-content")).toBeTruthy()
    expect(screen.queryByText("Acesso Negado")).toBeNull()
  })

  it("should redirect to /403 when moduleKey provided but hasModuleAccess returns false", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, hasModuleAccess: vi.fn(() => false) },
      { moduleKey: "agenda" },
    )

    expect(screen.getByTestId("forbidden-page")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })

  it("should render children when moduleKey provided and access granted", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, hasModuleAccess: vi.fn(() => true) },
      { moduleKey: "agenda" },
    )

    expect(screen.getByTestId("protected-content")).toBeTruthy()
    expect(screen.queryByTestId("forbidden-page")).toBeNull()
  })
})
