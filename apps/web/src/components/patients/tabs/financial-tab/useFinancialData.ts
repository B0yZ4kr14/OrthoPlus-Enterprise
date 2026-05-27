import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { PatientAdapter, type PatientAPI } from "@/lib/adapters/patientAdapter";

export function useFinancialData(patientId: string) {
  const { data: patient } = useQuery({
    queryKey: ["patient-financial", patientId],
    queryFn: async () => {
      const data = await apiClient.get<unknown>(`/pacientes/${patientId}`);
      return PatientAdapter.toFrontend(data as PatientAPI);
    },
  });

  const { data: budgets } = useQuery({
    queryKey: ["patient-budgets", patientId],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(
        `/pacientes/${patientId}/timeline`,
      );
      const events = data || [];
      return events.filter((e) => (e as { type: string }).type === "budget");
    },
  });

  return { patient, budgets };
}
