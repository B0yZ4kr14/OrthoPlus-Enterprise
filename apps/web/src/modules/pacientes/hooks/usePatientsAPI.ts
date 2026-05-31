/**
 * usePatientsAPI Hook
 * Hook compatível com tipos existentes do sistema que usa REST API
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { PatientAdapter } from "@/lib/adapters/patientAdapter";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";
import type { UsePatientsReturn } from "./types";

export function usePatientsAPI(): UsePatientsReturn {
  const { clinicId } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<{ patients: unknown[] }>(
        "/pacientes",
      );

      // Converter dados da API para formato global do sistema usando adapter
      const transformedPatients = PatientAdapter.toFrontendList(
        response.patients as Parameters<
          typeof PatientAdapter.toFrontendList
        >[0],
      );
      setPatients(transformedPatients);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      // Erro silencioso - hook retorna erro para UI
      toast.error("Erro ao carregar pacientes: " + _e.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const addPatient = async (patientData: Partial<Patient>) => {
    if (!clinicId) {
      toast.error("Nenhuma clínica selecionada");
      return;
    }

    try {
      const apiData = PatientAdapter.toAPI(patientData);
      await apiClient.post("/pacientes", apiData);

      toast.success("Paciente cadastrado com sucesso!");
      await loadPatients();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      // Erro silencioso - hook retorna erro para UI
      toast.error("Erro ao cadastrar paciente: " + _e.message);
      throw error;
    }
  };

  const updatePatient = async (
    patientId: string,
    patientData: Partial<Patient>,
  ) => {
    try {
      const apiData = PatientAdapter.toAPI(patientData);
      await apiClient.put(`/pacientes/${patientId}`, apiData);

      toast.success("Paciente atualizado com sucesso!");
      await loadPatients();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      // Erro silencioso - hook retorna erro para UI
      toast.error("Erro ao atualizar paciente: " + _e.message);
      throw error;
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      await apiClient.delete(`/pacientes/${patientId}`);
      toast.success("Paciente removido com sucesso!");
      await loadPatients();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      // Erro silencioso - hook retorna erro para UI
      toast.error("Erro ao remover paciente: " + _e.message);
      throw error;
    }
  };

  const getPatient = (patientId: string) => {
    return patients.find((p) => p.id === patientId);
  };

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    reloadPatients: loadPatients,
  };
}
