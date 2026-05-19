import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import * as AuthContext from "@/contexts/AuthContext"

const mockAuthState: any = {
  user: null,
  loading: false,
  isAdmin: false,
  isMember: false,
  isPatient: false,
  hasModuleAccess: vi.fn(() => false),
}

const mockUseAuth = vi.fn(() => mockAuthState)

// Mutate the module export BEFORE ProtectedRoute is imported
// @ts-ignore
AuthContext.useAuth = mockUseAuth

const { ProtectedRoute } = await import("../ProtectedRoute")

function renderProtectedRoute(
  authOverrides: Partial<typeof mockAuthState> = {},
  routeProps: {
    requireAdmin?: boolean
    requireStaff?: boolean
    requirePatient?: boolean
    moduleKey?: string
  } = {},
) {
  Object.assign(mockAuthState, {
    user: null,
    loading: false,
    isAdmin: false,
    isMember: false,
    isPatient: false,
    hasModuleAccess: vi.fn(() => false),
    ...authOverrides,
  })

  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/auth" element={<div data-testid="auth-page">Auth</div>} />
        <Route path="/403" element={<div data-testid="forbidden-page">403</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute {...routeProps}>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    Object.assign(mockAuthState, {
      user: null,
      loading: false,
      isAdmin: false,
      isMember: false,
      isPatient: false,
      hasModuleAccess: vi.fn(() => false),
    })
    mockUseAuth.mockImplementation(() => mockAuthState)
  })

  it("should render spinner while loading", () => {
    const { container } = renderProtectedRoute({ loading: true })

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
    expect(screen.queryByText("Acesso Negado")).not.toBeInTheDocument()
    expect(container.querySelector("svg")).toBeTruthy()
  })

  it("should redirect to /auth when no user", () => {
    renderProtectedRoute({ user: null })

    expect(screen.getByTestId("auth-page")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
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
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
  })

  it("should render children when requireAdmin=true and is admin", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isAdmin: true },
      { requireAdmin: true },
    )

    expect(screen.getByTestId("protected-content")).toBeTruthy()
    expect(screen.queryByText("Acesso Negado")).not.toBeInTheDocument()
  })

  it('should show "Acesso Negado" when requireStaff=true and is patient', () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isPatient: true, isMember: false },
      { requireStaff: true },
    )

    expect(screen.getByText("Acesso Negado")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
  })

  it("should render children when requireStaff=true and is member", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isPatient: false, isMember: true },
      { requireStaff: true },
    )

    expect(screen.getByTestId("protected-content")).toBeTruthy()
    expect(screen.queryByText("Acesso Negado")).not.toBeInTheDocument()
  })

  it('should show "Acesso Negado" when requirePatient=true and not patient', () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isPatient: false },
      { requirePatient: true },
    )

    expect(screen.getByText("Acesso Negado")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
  })

  it("should render children when requirePatient=true and is patient", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, isPatient: true },
      { requirePatient: true },
    )

    expect(screen.getByTestId("protected-content")).toBeTruthy()
    expect(screen.queryByText("Acesso Negado")).not.toBeInTheDocument()
  })

  it("should redirect to /403 when moduleKey provided but hasModuleAccess returns false", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, hasModuleAccess: vi.fn(() => false) },
      { moduleKey: "agenda" },
    )

    expect(screen.getByTestId("forbidden-page")).toBeTruthy()
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
  })

  it("should render children when moduleKey provided and access granted", () => {
    renderProtectedRoute(
      { user: { id: "user-1" }, hasModuleAccess: vi.fn(() => true) },
      { moduleKey: "agenda" },
    )

    expect(screen.getByTestId("protected-content")).toBeTruthy()
    expect(screen.queryByTestId("forbidden-page")).not.toBeInTheDocument()
  })
})
