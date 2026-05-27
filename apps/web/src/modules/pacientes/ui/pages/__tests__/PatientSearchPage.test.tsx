import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import PatientSearchPage from "../PatientSearchPage"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1", user: { id: "user-1" } }),
}))

vi.mock("use-debounce", () => ({
  useDebounce: (value: string) => [value],
}))

vi.mock("../../../hooks/usePatientsQuery", () => ({
  usePatientsQuery: vi.fn(),
}))

import { usePatientsQuery } from "../../../hooks/usePatientsQuery"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe("PatientSearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders search input and filters", () => {
    (usePatientsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
    })

    render(<PatientSearchPage />, { wrapper: createWrapper() })

    expect(
      screen.getByPlaceholderText(/Buscar por nome/),
    ).toBeTruthy()
    expect(screen.getByText("Novo Paciente")).toBeTruthy()
  })

  it("displays search results", () => {
    (usePatientsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        patients: [
          {
            id: "1",
            fullName: "Joao Silva",
            cpf: "000.000.000-00",
            phone: "(11) 99999-8888",
            email: "joao@example.com",
            status: "ATIVO",
            photoUrl: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
      isLoading: false,
      isFetching: false,
    })

    render(<PatientSearchPage />, { wrapper: createWrapper() })

    expect(screen.getByText("Joao Silva")).toBeTruthy()
    expect(screen.getByText("ATIVO")).toBeTruthy()
    expect(screen.getByText("1 paciente encontrado")).toBeTruthy()
  })

  it("navigates to patient detail on click", () => {
    (usePatientsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        patients: [
          {
            id: "1",
            fullName: "Joao Silva",
            cpf: null,
            phone: null,
            email: null,
            status: "ATIVO",
            photoUrl: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
      isLoading: false,
      isFetching: false,
    })

    render(<PatientSearchPage />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByText("Joao Silva"))
    expect(mockNavigate).toHaveBeenCalledWith("/pacientes/1")
  })

  it("shows empty state when no results", () => {
    (usePatientsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { patients: [], total: 0, page: 1, limit: 20 },
      isLoading: false,
      isFetching: false,
    })

    render(<PatientSearchPage />, { wrapper: createWrapper() })

    const searchInput = screen.getByPlaceholderText(/Buscar por nome/i)
    fireEvent.change(searchInput, { target: { value: "xyz" } })

    expect(
      screen.getByText(/Nenhum paciente encontrado/),
    ).toBeTruthy()
  })
})
