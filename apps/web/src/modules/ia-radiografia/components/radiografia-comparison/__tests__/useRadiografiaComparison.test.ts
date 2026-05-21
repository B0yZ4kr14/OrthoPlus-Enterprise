import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"

import { useRadiografiaComparison } from "../useRadiografiaComparison"
import type { AnaliseComplete } from "../../../types/radiografia.types"

function makeAnalise(overrides: Partial<AnaliseComplete> = {}): AnaliseComplete {
  return {
    id: "a1",
    clinic_id: "c1",
    paciente_id: "p1",
    tipo_radiografia: "PANORAMICA",
    imagem_url: "https://example.com/img.jpg",
    imagem_storage_path: "/path/img.jpg",
    status: "CONCLUIDA",
    revisada: false,
    problemas_detectados: 0,
    confidence_score: 0,
    created_at: "2024-01-15T10:00:00Z",
    ...overrides,
  }
}

describe("useRadiografiaComparison", () => {
  it("should initialize with empty selections", () => {
    const { result } = renderHook(() => useRadiografiaComparison([]))

    expect(result.current.analise1Id).toBe("")
    expect(result.current.analise2Id).toBe("")
    expect(result.current.analise1).toBeUndefined()
    expect(result.current.analise2).toBeUndefined()
    expect(result.current.comparacao).toBeNull()
    expect(result.current.analisesPorPaciente).toHaveLength(0)
  })

  it("should group analises by patient with at least 2 entries", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1", paciente_name: "João", created_at: "2024-01-20T10:00:00Z" }),
      makeAnalise({ id: "a2", paciente_id: "p1", paciente_name: "João", created_at: "2024-01-15T10:00:00Z" }),
      makeAnalise({ id: "a3", paciente_id: "p2", paciente_name: "Maria", created_at: "2024-01-10T10:00:00Z" }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    // p2 has only 1 analise, so should be filtered out
    expect(result.current.analisesPorPaciente).toHaveLength(1)
    expect(result.current.analisesPorPaciente[0].patientId).toBe("p1")
    expect(result.current.analisesPorPaciente[0].patientName).toBe("João")
    expect(result.current.analisesPorPaciente[0].analises).toHaveLength(2)
    // Should be sorted newest first
    expect(result.current.analisesPorPaciente[0].analises[0].id).toBe("a1")
    expect(result.current.analisesPorPaciente[0].analises[1].id).toBe("a2")
  })

  it("should find analise by id when selected", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1" }),
      makeAnalise({ id: "a2", paciente_id: "p1" }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    act(() => {
      result.current.setAnalise1Id("a1")
      result.current.setAnalise2Id("a2")
    })

    expect(result.current.analise1?.id).toBe("a1")
    expect(result.current.analise2?.id).toBe("a2")
  })

  it("should compute comparacao with aumentou tendencia", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1", problemas_detectados: 2, confidence_score: 80, created_at: "2024-01-15T10:00:00Z" }),
      makeAnalise({ id: "a2", paciente_id: "p1", problemas_detectados: 5, confidence_score: 90, created_at: "2024-01-20T10:00:00Z" }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    act(() => {
      result.current.setAnalise1Id("a1")
      result.current.setAnalise2Id("a2")
    })

    expect(result.current.comparacao).not.toBeNull()
    expect(result.current.comparacao?.problemas.valor).toBe(3)
    expect(result.current.comparacao?.problemas.tendencia).toBe("aumentou")
    expect(result.current.comparacao?.problemas.percentual).toBe("150.0")
    expect(result.current.comparacao?.precisao.valor).toBe("10.0")
    expect(result.current.comparacao?.precisao.tendencia).toBe("melhorou")
    expect(result.current.comparacao?.diasEntre).toBe(5)
  })

  it("should compute comparacao with diminuiu tendencia", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1", problemas_detectados: 5, confidence_score: 90, created_at: "2024-01-15T10:00:00Z" }),
      makeAnalise({ id: "a2", paciente_id: "p1", problemas_detectados: 2, confidence_score: 80, created_at: "2024-01-20T10:00:00Z" }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    act(() => {
      result.current.setAnalise1Id("a1")
      result.current.setAnalise2Id("a2")
    })

    expect(result.current.comparacao?.problemas.tendencia).toBe("diminuiu")
    expect(result.current.comparacao?.problemas.percentual).toBe("-60.0")
    expect(result.current.comparacao?.precisao.tendencia).toBe("piorou")
  })

  it("should compute comparacao with manteve tendencia", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1", problemas_detectados: 3, confidence_score: 85, created_at: "2024-01-15T10:00:00Z" }),
      makeAnalise({ id: "a2", paciente_id: "p1", problemas_detectados: 3, confidence_score: 85, created_at: "2024-01-20T10:00:00Z" }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    act(() => {
      result.current.setAnalise1Id("a1")
      result.current.setAnalise2Id("a2")
    })

    expect(result.current.comparacao?.problemas.tendencia).toBe("manteve")
    expect(result.current.comparacao?.precisao.tendencia).toBe("manteve")
  })

  it("should return null comparacao when only one analise selected", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1" }),
      makeAnalise({ id: "a2", paciente_id: "p1" }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    act(() => {
      result.current.setAnalise1Id("a1")
    })

    expect(result.current.comparacao).toBeNull()
  })

  it("should handlePacienteSelect set both analises", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1", created_at: "2024-01-20T10:00:00Z" }),
      makeAnalise({ id: "a2", paciente_id: "p1", created_at: "2024-01-15T10:00:00Z" }),
      makeAnalise({ id: "a3", paciente_id: "p1", created_at: "2024-01-10T10:00:00Z" }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    act(() => {
      result.current.handlePacienteSelect("p1")
    })

    expect(result.current.analise1Id).toBe("a1")
    expect(result.current.analise2Id).toBe("a2")
  })

  it("should default patient name to Paciente when paciente_name missing", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1", paciente_name: undefined }),
      makeAnalise({ id: "a2", paciente_id: "p1", paciente_name: undefined }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    expect(result.current.analisesPorPaciente[0].patientName).toBe("Paciente")
  })

  it("should handle problemas1 zero for percentual calculation", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ id: "a1", paciente_id: "p1", problemas_detectados: 0, created_at: "2024-01-15T10:00:00Z" }),
      makeAnalise({ id: "a2", paciente_id: "p1", problemas_detectados: 3, created_at: "2024-01-20T10:00:00Z" }),
    ]

    const { result } = renderHook(() => useRadiografiaComparison(analises))

    act(() => {
      result.current.setAnalise1Id("a1")
      result.current.setAnalise2Id("a2")
    })

    expect(result.current.comparacao?.problemas.percentual).toBe("0")
  })
})
