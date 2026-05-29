import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import { useIAInsights } from "../useIAInsights";
import type {
  AnaliseComplete,
  ProblemaRadiografico,
} from "../../../types/radiografia.types";

function makeAnalise(
  overrides: Partial<AnaliseComplete> = {},
): AnaliseComplete {
  return {
    id: "a1",
    clinic_id: "c1",
    paciente_id: "p1",
    tipo_radiografia: "PANORAMICA",
    imagem_url: "https://example.com/img.jpg",
    imagem_storage_path: "/path/img.jpg",
    status: "CONCLUIDA",
    revisada: false,

    confidence_score: 0,
    ...overrides,
  };
}

describe("useIAInsights", () => {
  it("should return empty insights when no analises", () => {
    const { result } = renderHook(() => useIAInsights([]));

    expect(result.current.padroesMaisComuns).toHaveLength(0);
    expect(result.current.areasProblematicas).toHaveLength(0);
    expect(result.current.severidades).toHaveLength(0);
    expect(result.current.tiposMaisAnalisados).toHaveLength(0);
    expect(result.current.taxaMediaProblemas).toBe(0);
    expect(result.current.precisaoMediaGeral).toBe(0);
    expect(result.current.recomendacoesPreventivas).toHaveLength(0);
  });

  it("should compute padroesMaisComuns sorted by count", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              localizacao: "Dente 14",
              severidade: "LEVE",
            } as unknown as ProblemaRadiografico,
            {
              tipo_problema: "CARIE",
              localizacao: "Dente 16",
              severidade: "MODERADA",
            } as unknown as ProblemaRadiografico,
            {
              tipo_problema: "FRATURA",
              localizacao: "Dente 21",
              severidade: "GRAVE",
            } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              localizacao: "Dente 14",
              severidade: "LEVE",
            } as unknown as ProblemaRadiografico,
            {
              tipo_problema: "PERIODONTAL",
              localizacao: "Dente 36",
              severidade: "MODERADA",
            } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.padroesMaisComuns).toEqual([
      { tipo: "CARIE", ocorrencias: 3 },
      { tipo: "FRATURA", ocorrencias: 1 },
      { tipo: "PERIODONTAL", ocorrencias: 1 },
    ]);
  });

  it("should compute areasProblematicas sorted by count", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              localizacao: "Arcada Superior",
              severidade: "LEVE",
            } as unknown as ProblemaRadiografico,
            {
              tipo_problema: "CARIE",
              localizacao: "Arcada Superior",
              severidade: "MODERADA",
            } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              localizacao: "Arcada Inferior",
              severidade: "LEVE",
            } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.areasProblematicas).toEqual([
      { area: "Arcada Superior", ocorrencias: 2 },
      { area: "Arcada Inferior", ocorrencias: 1 },
    ]);
  });

  it("should compute severidades sorted by count", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              localizacao: "Dente 14",
              severidade: "ALTA",
            } as unknown as ProblemaRadiografico,
            {
              tipo_problema: "CARIE",
              localizacao: "Dente 16",
              severidade: "MEDIA",
            } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              localizacao: "Dente 14",
              severidade: "ALTA",
            } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.severidades).toEqual([
      { severidade: "ALTA", quantidade: 2 },
      { severidade: "MEDIA", quantidade: 1 },
    ]);
  });

  it("should compute tiposMaisAnalisados with labels", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ tipo_radiografia: "PANORAMICA" }),
      makeAnalise({ tipo_radiografia: "PANORAMICA" }),
      makeAnalise({ tipo_radiografia: "PERIAPICAL" }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.tiposMaisAnalisados).toEqual([
      { tipo: "Panorâmica", quantidade: 2 },
      { tipo: "Periapical", quantidade: 1 },
    ]);
  });

  it("should compute taxaMediaProblemas", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ problemas_detectados: 4 }),
      makeAnalise({ problemas_detectados: 2 }),
      makeAnalise({ problemas_detectados: 0 }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.taxaMediaProblemas).toBe("2.0");
  });

  it("should compute precisaoMediaGeral rounded", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ confidence_score: 85 }),
      makeAnalise({ confidence_score: 95 }),
      makeAnalise({ confidence_score: 0 }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.precisaoMediaGeral).toBe(90);
  });

  it("should return 0 precisaoMediaGeral when no scores", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ confidence_score: 0 }),
      makeAnalise({ confidence_score: undefined }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.precisaoMediaGeral).toBe(0);
  });

  it("should generate recomendacao preventiva for padrao dominante", () => {
    const analises: AnaliseComplete[] = Array.from({ length: 10 }, () =>
      makeAnalise({
        problemas_detectados: 1,
        resultado_ia: {
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              localizacao: "Dente 14",
              severidade: "LEVE",
            } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
    );

    const { result } = renderHook(() => useIAInsights(analises));

    const recomendacao = result.current.recomendacoesPreventivas.find((r) =>
      r.titulo.startsWith("Foco em"),
    );
    expect(recomendacao).toBeDefined();
    expect(recomendacao?.prioridade).toBe("alta");
  });

  it("should generate recomendacao for taxa elevada de problemas", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({ problemas_detectados: 5 }),
      makeAnalise({ problemas_detectados: 4 }),
      makeAnalise({ problemas_detectados: 3 }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    const recomendacao = result.current.recomendacoesPreventivas.find((r) =>
      r.titulo.includes("Taxa elevada"),
    );
    expect(recomendacao).toBeDefined();
    expect(recomendacao?.prioridade).toBe("media");
  });

  it("should generate recomendacao manutencao when no issues and many analises", () => {
    const analises: AnaliseComplete[] = Array.from({ length: 6 }, () =>
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
    );

    const { result } = renderHook(() => useIAInsights(analises));

    const recomendacao = result.current.recomendacoesPreventivas.find((r) =>
      r.titulo.includes("Manutenção"),
    );
    expect(recomendacao).toBeDefined();
    expect(recomendacao?.prioridade).toBe("baixa");
  });

  it("should default severidade to MEDIA when missing", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              localizacao: "Dente 14",
            } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.severidades).toEqual([
      { severidade: "MÉDIA", quantidade: 1 },
    ]);
  });

  it("should default area to Nao especificada when missing", () => {
    const analises: AnaliseComplete[] = [
      makeAnalise({
        resultado_ia: {
          problemas_detectados: [
            { tipo_problema: "CARIE" } as unknown as ProblemaRadiografico,
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "",
        },
      }),
    ];

    const { result } = renderHook(() => useIAInsights(analises));

    expect(result.current.areasProblematicas).toEqual([
      { area: "Não especificada", ocorrencias: 1 },
    ]);
  });
});
