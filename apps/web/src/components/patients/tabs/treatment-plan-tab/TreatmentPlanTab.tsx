import { Button } from "@orthoplus/core-ui/button";
import { Plus } from "lucide-react";
import type { TreatmentPlanTabProps } from "./types";
import { useTreatmentPlan } from "./useTreatmentPlan";
import { TreatmentCard } from "./TreatmentCard";
import { EmptyState } from "./EmptyState";

export function TreatmentPlanTab({ patientId }: TreatmentPlanTabProps) {
  const { treatments, isLoading, getStatusIcon, getStatusLabel } = useTreatmentPlan({ patientId });

  if (isLoading) {
    return <div>Carregando planos de tratamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Plano de Tratamento</h2>
          <p className="text-muted-foreground">Procedimentos planejados e realizados</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tratamento
        </Button>
      </div>

      {treatments.length > 0 ? (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              statusIcon={getStatusIcon(treatment.status)}
              statusLabel={getStatusLabel(treatment.status)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
