import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useNavigate } from "react-router-dom";
import type { Patient, PatientHeaderProps } from "./types";

function getInitials(name: string): string {
  const parts = name.split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

export function usePatientHeader({ patientId }: PatientHeaderProps) {
  const navigate = useNavigate();

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: ["patient-header", patientId],
    queryFn: async () => {
      const data = await apiClient.get<Record<string, unknown>[]>(
        `/patients?id=eq.${patientId}&limit=1`,
      );
      if (!data || data.length === 0) throw new Error("Patient not found");
      return data[0] as unknown as Patient;
    },
  });

  const handleEdit = () => {
    navigate(`/pacientes/editar/${patientId}`);
  };

  const initials = patient ? getInitials(patient.full_name) : "";

  return {
    patient,
    isLoading,
    initials,
    handleEdit,
  };
}
