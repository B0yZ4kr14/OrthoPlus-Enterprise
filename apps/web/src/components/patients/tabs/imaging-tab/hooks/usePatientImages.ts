import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import type { PatientImage } from "../types";

export function usePatientImages(patientId: string) {
  return useQuery({
    queryKey: ["patient-images", patientId],
    queryFn: async () => {
      const data = await apiClient.get<PatientImage[]>(
        `/pacientes/${patientId}/imaging`,
      );
      return data || [];
    },
  });
}
