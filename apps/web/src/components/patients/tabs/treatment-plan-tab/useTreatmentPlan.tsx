import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { Treatment, TreatmentPlanTabProps, StatusConfig } from "./types";

const STATUS_LABELS: Record<string, string> = {
  planejado: "Planejado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  concluido: { label: "Concluído", iconColor: "text-success" },
  em_andamento: { label: "Em Andamento", iconColor: "text-warning" },
  cancelado: { label: "Cancelado", iconColor: "text-destructive" },
  default: { label: "Pendente", iconColor: "" },
};

export function useTreatmentPlan({ patientId }: TreatmentPlanTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["patient-treatments", patientId],
    queryFn: async () => {
      const response = await apiClient.get<Treatment[]>(
        `/pep/tratamentos/patient/${patientId}`,
      );
      return response || [];
    },
  });

  const treatments = data || [];

  const getStatusIcon = (status: string) => {
    const iconClass = STATUS_CONFIG[status]?.iconColor || "";
    switch (status) {
      case "concluido":
        return <CheckCircle className={`h-4 w-4 ${iconClass}`} />;
      case "em_andamento":
        return <Clock className={`h-4 w-4 ${iconClass}`} />;
      case "cancelado":
        return <XCircle className={`h-4 w-4 ${iconClass}`} />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => STATUS_LABELS[status] || status;

  return {
    treatments,
    isLoading,
    getStatusIcon,
    getStatusLabel,
  };
}
