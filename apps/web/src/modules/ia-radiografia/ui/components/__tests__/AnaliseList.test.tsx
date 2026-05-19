import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { AnaliseList } from "../AnaliseList"
import type { AnaliseComplete } from "../../../types/radiografia.types"

const mockOnPageChange = vi.fn()
const mockOnViewDetails = vi.fn()

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, disabled, size, variant, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-size={size} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@orthoplus/core-ui/skeleton", () => ({
  Skeleton: ({ className }: any) => <div className={className}>skeleton</div>,
}))

const mockAnalises: AnaliseComplete[] = [
  {
    id: "a1",
    clinic_id: "c1",
    patient_id: "p1",
    tipo_radiografia: "PANORAMICA",
    imagem_url: "https://example.com/img1.jpg",
    imagem_storage_path: "/path/img1.jpg",
    status_analise: "CONCLUIDA",
    revisado_por_dentista: false,
    patient_name: "João Silva",
    problemas_detectados: 3,
    confidence_score: 87,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "a2",
    clinic_id: "c1",
    patient_id: "p2",
    tipo_radiografia: "PERIAPICAL",
    imagem_url: "https://example.com/img2.jpg",
    imagem_storage_path: "/path/img2.jpg",
    status_analise: "PROCESSANDO",
    revisado_por_dentista: false,
    patient_name: "Maria Souza",
    problemas_detectados: 1,
    confidence_score: 92,
    created_at: "2024-01-20T14:30:00Z",
  },
]

describe("AnaliseList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render loading skeletons", () => {
    render(
      <AnaliseList
        analises={[]}
        loading={true}
        currentPage={1}
        totalPages={1}
        totalItems={0}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    expect(screen.getAllByText("skeleton").length).toBeGreaterThan(0)
  })

  it("should render empty state when no analises", () => {
    render(
      <AnaliseList
        analises={[]}
        loading={false}
        currentPage={1}
        totalPages={1}
        totalItems={0}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    expect(screen.getByText("Nenhuma análise realizada ainda")).toBeTruthy()
    expect(screen.getByText("Faça upload de um raio-X para começar")).toBeTruthy()
  })

  it("should render list of analises", () => {
    render(
      <AnaliseList
        analises={mockAnalises}
        loading={false}
        currentPage={1}
        totalPages={1}
        totalItems={2}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Maria Souza")).toBeTruthy()
    expect(screen.getByText("Panorâmica")).toBeTruthy()
    expect(screen.getByText("Periapical")).toBeTruthy()
    expect(screen.getByText("CONCLUIDA")).toBeTruthy()
    expect(screen.getByText("PROCESSANDO")).toBeTruthy()
    expect(screen.getByText("3 problema(s) detectado(s)")).toBeTruthy()
    expect(screen.getByText("1 problema(s) detectado(s)")).toBeTruthy()
  })

  it("should display confidence score when available", () => {
    render(
      <AnaliseList
        analises={mockAnalises}
        loading={false}
        currentPage={1}
        totalPages={1}
        totalItems={2}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    expect(screen.getByText("87%")).toBeTruthy()
    expect(screen.getByText("92%")).toBeTruthy()
    expect(screen.getAllByText("Confiança da IA")).toHaveLength(2)
  })

  it("should call onViewDetails when clicking Ver Detalhes", () => {
    render(
      <AnaliseList
        analises={mockAnalises}
        loading={false}
        currentPage={1}
        totalPages={1}
        totalItems={2}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    const buttons = screen.getAllByText("Ver Detalhes")
    act(() => {
      buttons[0].click()
    })

    expect(mockOnViewDetails).toHaveBeenCalledTimes(1)
    expect(mockOnViewDetails).toHaveBeenCalledWith(
      expect.objectContaining({ id: "a1", patient_name: "João Silva" }),
    )
  })

  it("should render pagination when multiple pages", () => {
    const manyAnalises: AnaliseComplete[] = Array.from({ length: 15 }, (_, i) => ({
      ...mockAnalises[0],
      id: `a${i + 1}`,
      patient_name: `Paciente ${i + 1}`,
    }))

    render(
      <AnaliseList
        analises={manyAnalises.slice(0, 10)}
        loading={false}
        currentPage={1}
        totalPages={2}
        totalItems={15}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    expect(screen.getByText("Mostrando 1 a 10 de 15 análises")).toBeTruthy()
    expect(screen.getByText("1")).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()
  })

  it("should call onPageChange when clicking page number", () => {
    const manyAnalises: AnaliseComplete[] = Array.from({ length: 15 }, (_, i) => ({
      ...mockAnalises[0],
      id: `a${i + 1}`,
      patient_name: `Paciente ${i + 1}`,
    }))

    render(
      <AnaliseList
        analises={manyAnalises.slice(0, 10)}
        loading={false}
        currentPage={1}
        totalPages={2}
        totalItems={15}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    const page2Button = screen.getByText("2")
    act(() => {
      page2Button.click()
    })

    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it("should call onPageChange with previous page when clicking left chevron", () => {
    const manyAnalises: AnaliseComplete[] = Array.from({ length: 15 }, (_, i) => ({
      ...mockAnalises[0],
      id: `a${i + 1}`,
      patient_name: `Paciente ${i + 1}`,
    }))

    render(
      <AnaliseList
        analises={manyAnalises.slice(10, 15)}
        loading={false}
        currentPage={2}
        totalPages={2}
        totalItems={15}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    // Find prev button by chevron-left icon title or by searching buttons with chevron
    const buttons = screen.getAllByRole("button")
    // Prev button is the first pagination button (before page numbers)
    const prevButton = buttons.find((b) =>
      b.innerHTML.includes("lucide-chevron-left"),
    )
    expect(prevButton).toBeTruthy()
    act(() => {
      prevButton!.click()
    })

    expect(mockOnPageChange).toHaveBeenCalledWith(1)
  })

  it("should disable prev button on first page", () => {
    const manyAnalises: AnaliseComplete[] = Array.from({ length: 15 }, (_, i) => ({
      ...mockAnalises[0],
      id: `a${i + 1}`,
      patient_name: `Paciente ${i + 1}`,
    }))

    render(
      <AnaliseList
        analises={manyAnalises.slice(0, 10)}
        loading={false}
        currentPage={1}
        totalPages={2}
        totalItems={15}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />,
    )

    const allButtons = screen.getAllByRole("button")
    // Find the prev chevron button (first pagination button)
    const prevButton = allButtons.find((b) =>
      b.innerHTML.includes("lucide-chevron-left"),
    )
    expect(prevButton).toHaveProperty("disabled", true)
  })
})
