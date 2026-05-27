// cspell:disable
import { useMemo } from "react";
import type { AnaliseComplete } from "../../types/radiografia.types";
import { tipoRadiografiaLabels } from "../../types/radiografia.types";
import type {
  ProblemaPattern,
  AreaProblematica,
  SeveridadeCount,
  TipoAnaliseCount,
  RecomendacaoPreventiva,
} from "./types";

function countProblemas(analises: AnaliseComplete[]): Map<string, number> {
  const problemas = new Map<string, number>();

  analises.forEach((analise) => {
    const problemasDetectados = analise.resultado_ia?.problemas_detectados || [];
    problemasDetectados.forEach((problema: Record<string, unknown>) => {
      const tipo = (problema.tipo_problema as string) || "Problema Dentário";
      problemas.set(tipo, (problemas.get(tipo) || 0) + 1);
    });
  });

  return problemas;
}

function countAreas(analises: AnaliseComplete[]): Map<string, number> {
  const areas = new Map<string, number>();

  analises.forEach((analise) => {
    const problemasDetectados = analise.resultado_ia?.problemas_detectados || [];
    problemasDetectados.forEach((problema: Record<string, unknown>) => {
      const localizacao = (problema.localizacao as string) || "Não especificada";
      areas.set(localizacao, (areas.get(localizacao) || 0) + 1);
    });
  });

  return areas;
}

function countSeveridades(analises: AnaliseComplete[]): Map<string, number> {
  const sevs = new Map<string, number>();

  analises.forEach((analise) => {
    const problemasDetectados = analise.resultado_ia?.problemas_detectados || [];
    problemasDetectados.forEach((problema: Record<string, unknown>) => {
      const sev = (problema.severidade as string) || "MÉDIA";
      sevs.set(sev, (sevs.get(sev) || 0) + 1);
    });
  });

  return sevs;
}

function countTipos(analises: AnaliseComplete[]): Map<string, number> {
  const tipos = new Map<string, number>();

  analises.forEach((analise) => {
    const tipo =
      tipoRadiografiaLabels[
        analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels
      ] || analise.tipo_radiografia;
    tipos.set(tipo, (tipos.get(tipo) || 0) + 1);
  });

  return tipos;
}

export function useIAInsights(analises: AnaliseComplete[]) {
  const padroesMaisComuns: ProblemaPattern[] = useMemo(() => {
    const problemas = countProblemas(analises);
    return Array.from(problemas.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tipo, ocorrencias]) => ({ tipo, ocorrencias }));
  }, [analises]);

  const areasProblematicas: AreaProblematica[] = useMemo(() => {
    const areas = countAreas(analises);
    return Array.from(areas.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area, ocorrencias]) => ({ area, ocorrencias }));
  }, [analises]);

  const severidades: SeveridadeCount[] = useMemo(() => {
    const sevs = countSeveridades(analises);
    return Array.from(sevs.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([severidade, quantidade]) => ({ severidade, quantidade }));
  }, [analises]);

  const tiposMaisAnalisados: TipoAnaliseCount[] = useMemo(() => {
    const tipos = countTipos(analises);
    return Array.from(tipos.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tipo, quantidade]) => ({ tipo, quantidade }));
  }, [analises]);

  const taxaMediaProblemas = useMemo(() => {
    if (analises.length === 0) return 0;
    const totalProblemas = analises.reduce(
      (sum, a) => sum + (a.problemas_detectados || 0),
      0
    );
    return (totalProblemas / analises.length).toFixed(1);
  }, [analises]);

  const precisaoMediaGeral = useMemo(() => {
    const analisesComPrecisao = analises.filter(
      (a) => a.confidence_score && a.confidence_score > 0
    );
    if (analisesComPrecisao.length === 0) return 0;
    const totalPrecisao = analisesComPrecisao.reduce(
      (sum, a) => sum + (a.confidence_score || 0),
      0
    );
    return Math.round(totalPrecisao / analisesComPrecisao.length);
  }, [analises]);

  const recomendacoesPreventivas: RecomendacaoPreventiva[] = useMemo(() => {
    const recomendacoes: RecomendacaoPreventiva[] = [];

    if (
      padroesMaisComuns.length > 0 &&
      padroesMaisComuns[0].ocorrencias > analises.length * 0.3
    ) {
      recomendacoes.push({
        titulo: `Foco em ${padroesMaisComuns[0].tipo}`,
        descricao: `Este tipo de problema representa ${Math.round(
          (padroesMaisComuns[0].ocorrencias / analises.length) * 100
        )}% das análises. Considere implementar protocolos preventivos específicos.`,
        prioridade: "alta",
      });
    }

    if (
      areasProblematicas.length > 0 &&
      areasProblematicas[0].ocorrencias > analises.length * 0.25
    ) {
      recomendacoes.push({
        titulo: `Atenção à área: ${areasProblematicas[0].area}`,
        descricao: `Esta área apresenta problemas recorrentes. Recomenda-se exames mais frequentes e acompanhamento preventivo.`,
        prioridade: "alta",
      });
    }

    if (Number(taxaMediaProblemas) > 2) {
      recomendacoes.push({
        titulo: "Taxa elevada de problemas detectados",
        descricao: `Média de ${taxaMediaProblemas} problemas por análise. Considere revisar protocolos de higiene oral e frequência de check-ups.`,
        prioridade: "media",
      });
    }

    const problemasAltos = severidades.find((s) => s.severidade === "ALTA");
    if (problemasAltos && problemasAltos.quantidade > analises.length * 0.15) {
      recomendacoes.push({
        titulo: "Casos de alta severidade frequentes",
        descricao: `${problemasAltos.quantidade} casos de alta severidade detectados. Priorize intervenções rápidas e acompanhamento intensivo.`,
        prioridade: "alta",
      });
    }

    if (recomendacoes.length === 0 && analises.length > 5) {
      recomendacoes.push({
        titulo: "Manutenção do padrão atual",
        descricao:
          "Os dados indicam boa saúde dental geral. Continue com os protocolos preventivos atuais e check-ups regulares.",
        prioridade: "baixa",
      });
    }

    return recomendacoes;
  }, [
    padroesMaisComuns,
    areasProblematicas,
    taxaMediaProblemas,
    severidades,
    analises.length,
  ]);

  return {
    padroesMaisComuns,
    areasProblematicas,
    severidades,
    tiposMaisAnalisados,
    taxaMediaProblemas,
    precisaoMediaGeral,
    recomendacoesPreventivas,
  };
}
