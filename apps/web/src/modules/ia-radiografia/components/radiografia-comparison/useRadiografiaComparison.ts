// cspell:disable
import { useState, useMemo, useCallback } from "react";
import type { AnaliseComplete } from "../../types/radiografia.types";
import type { PacienteAnalises, ComparacaoData } from "./types";

export function useRadiografiaComparison(analises: AnaliseComplete[]) {
  const [analise1Id, setAnalise1Id] = useState<string>("");
  const [analise2Id, setAnalise2Id] = useState<string>("");

  const analisesPorPaciente: PacienteAnalises[] = useMemo(() => {
    const pacientes = new Map<string, AnaliseComplete[]>();

    analises.forEach((analise) => {
      const patientId = analise.patient_id;
      if (!pacientes.has(patientId)) {
        pacientes.set(patientId, []);
      }
      pacientes.get(patientId)!.push(analise);
    });

    return Array.from(pacientes.entries())
      .filter(([_, analisesArr]) => analisesArr.length >= 2)
      .map(([patientId, analisesArr]) => ({
        patientId,
        patientName: analisesArr[0]?.patient_name || "Paciente",
        analises: analisesArr.sort(
          (a, b) =>
            new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime(),
        ),
      }));
  }, [analises]);

  const analise1 = useMemo(
    () => analises.find((a) => a.id === analise1Id),
    [analises, analise1Id],
  );

  const analise2 = useMemo(
    () => analises.find((a) => a.id === analise2Id),
    [analises, analise2Id],
  );

  const comparacao: ComparacaoData | null = useMemo(() => {
    if (!analise1 || !analise2) return null;

    const problemas1 = analise1.problemas_detectados || 0;
    const problemas2 = analise2.problemas_detectados || 0;
    const diferencaProblemas = problemas2 - problemas1;

    const precisao1 = analise1.confidence_score || 0;
    const precisao2 = analise2.confidence_score || 0;
    const diferencaPrecisao = precisao2 - precisao1;

    const diasEntre = Math.abs(
      Math.floor(
        (new Date(analise2.created_at ?? "").getTime() -
          new Date(analise1.created_at ?? "").getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    return {
      problemas: {
        valor: diferencaProblemas,
        percentual: problemas1 > 0 ? ((diferencaProblemas / problemas1) * 100).toFixed(1) : "0",
        tendencia:
          diferencaProblemas > 0 ? "aumentou" : diferencaProblemas < 0 ? "diminuiu" : "manteve",
      },
      precisao: {
        valor: diferencaPrecisao.toFixed(1),
        tendencia:
          diferencaPrecisao > 0 ? "melhorou" : diferencaPrecisao < 0 ? "piorou" : "manteve",
      },
      diasEntre,
    };
  }, [analise1, analise2]);

  const handlePacienteSelect = useCallback((patientId: string) => {
    const paciente = analisesPorPaciente.find((p) => p.patientId === patientId);
    if (paciente && paciente.analises.length >= 2) {
      setAnalise1Id(paciente.analises[0].id ?? "");
      setAnalise2Id(paciente.analises[1].id ?? "");
    }
  }, [analisesPorPaciente]);

  return {
    analise1Id,
    analise2Id,
    setAnalise1Id,
    setAnalise2Id,
    analisesPorPaciente,
    analise1,
    analise2,
    comparacao,
    handlePacienteSelect,
  };
}
