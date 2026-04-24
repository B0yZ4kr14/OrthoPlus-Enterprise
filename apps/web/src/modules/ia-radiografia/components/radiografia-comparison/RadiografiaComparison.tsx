// cspell:disable
import { GitCompare } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { useRadiografiaComparison } from "./useRadiografiaComparison";
import { PatientSelector } from "./PatientSelector";
import { AnaliseCard } from "./AnaliseCard";
import { ComparacaoStats } from "./ComparacaoStats";
import { AnaliseSelector } from "./AnaliseSelector";
import { EmptyState } from "./EmptyState";
import type { AnaliseComplete } from "../../types/radiografia.types";

interface RadiografiaComparisonProps {
  analises: AnaliseComplete[];
}

export function RadiografiaComparison({ analises }: RadiografiaComparisonProps) {
  const {
    analise1Id,
    analise2Id,
    setAnalise1Id,
    setAnalise2Id,
    analisesPorPaciente,
    analise1,
    analise2,
    comparacao,
    handlePacienteSelect,
  } = useRadiografiaComparison(analises);

  const pacienteAnalises = analise1
    ? analisesPorPaciente.find((p) => p.patientId === analise1.patient_id)?.analises || []
    : [];

  return (
    <Card className="p-6" depth="intense">
      <div className="flex items-center gap-2 mb-6">
        <GitCompare className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Comparação de Radiografias</h2>
      </div>

      {analisesPorPaciente.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <PatientSelector
            pacientes={analisesPorPaciente}
            selectedPatientId={analise1?.patient_id || ""}
            onSelect={handlePacienteSelect}
          />

          {analise1 && analise2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnaliseCard
                  analise={analise1}
                  variant="primary"
                  badgeLabel="Primeira Análise"
                />
                <AnaliseCard
                  analise={analise2}
                  variant="success"
                  badgeLabel="Segunda Análise"
                />
              </div>

              {comparacao && (
                <ComparacaoStats
                  analise1={analise1}
                  analise2={analise2}
                  comparacao={comparacao}
                />
              )}

              <AnaliseSelector
                analises={pacienteAnalises}
                analise1Id={analise1Id}
                analise2Id={analise2Id}
                onAnalise1Change={setAnalise1Id}
                onAnalise2Change={setAnalise2Id}
              />
            </>
          )}
        </div>
      )}
    </Card>
  );
}

export default RadiografiaComparison;
