/**
 * usePatientTimeline Hook
 * Busca timeline de eventos do paciente (agendamentos, tratamentos, orçamentos, status)
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";

export interface TimelineEvent {
  id: string;
  type: "appointment" | "treatment" | "budget" | "status_change" | "payment" | "document";
  title: string;
  description: string;
  date: string;
  icon?: string;
}

interface TimelineResponse {
  timeline: TimelineEvent[];
}

export function usePatientTimeline(patientId: string | undefined) {
  return useQuery<TimelineEvent[]>({
    queryKey: ["patient-timeline", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await apiClient.get<TimelineResponse>(
        `/pacientes/${patientId}/timeline`,
      );
      return response.timeline ?? [];
    },
    enabled: !!patientId,
  });
}
