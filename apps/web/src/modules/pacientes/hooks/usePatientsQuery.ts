/**
 * usePatientsQuery — React Query hooks for patient data
 *
 * Replaces legacy useState/useEffect pattern with server state management.
 * Legacy usePatientsAPI.ts preserved for backward compatibility.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";

const PATIENTS_KEY = "patients";

// ─── Queries ───────────────────────────────────────────────────────────────

export interface PatientSearchParams {
  query?: string;
  status?: string;
  dentistaId?: string;
  page?: number;
  limit?: number;
}

export interface PatientSearchItem {
  id: string;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  photoUrl: string | null;
}

export interface PatientSearchResponse {
  patients: PatientSearchItem[];
  total: number;
  page: number;
  limit: number;
}

export function usePatientsQuery(params: PatientSearchParams = {}) {
  return useQuery({
    queryKey: [PATIENTS_KEY, params],
    queryFn: async (): Promise<PatientSearchResponse> => {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set("q", params.query);
      if (params.status) searchParams.set("status", params.status);
      if (params.dentistaId) searchParams.set("dentistaId", params.dentistaId);
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));

      const response = await apiClient.get<PatientSearchResponse>(
        `/pacientes/search?${searchParams.toString()}`,
      );
      return response;
    },
    staleTime: 30_000,
  });
}

export function usePatientQuery(patientId: string | undefined) {
  return useQuery({
    queryKey: [PATIENTS_KEY, "detail", patientId],
    queryFn: async (): Promise<Patient> => {
      const response = await apiClient.get<Patient>(`/pacientes/${patientId}`);
      return response;
    },
    enabled: !!patientId,
    staleTime: 60_000,
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Patient>): Promise<Patient> => {
      const response = await apiClient.post<Patient>("/pacientes", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
      toast.success("Paciente cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao cadastrar paciente: " + error.message);
    },
  });
}

export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      data,
    }: {
      patientId: string;
      data: Partial<Patient>;
    }): Promise<Patient> => {
      const response = await apiClient.put<Patient>(
        `/pacientes/${patientId}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
      queryClient.invalidateQueries({
        queryKey: [PATIENTS_KEY, "detail", variables.patientId],
      });
      toast.success("Paciente atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar paciente: " + error.message);
    },
  });
}

export function useDeletePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string): Promise<void> => {
      await apiClient.delete(`/pacientes/${patientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
      toast.success("Paciente removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover paciente: " + error.message);
    },
  });
}
