import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";
import type { UsePatientsReturn } from "./types";
import { PatientRepositoryApi } from "../infrastructure/repositories/PatientRepositoryApi";
import { ListPatientsUseCase } from "../application/useCases/ListPatientsUseCase";
import { AddPatientUseCase } from "../application/useCases/AddPatientUseCase";
import { UpdatePatientUseCase } from "../application/useCases/UpdatePatientUseCase";
import { DeletePatientUseCase } from "../application/useCases/DeletePatientUseCase";

const patientRepo = new PatientRepositoryApi();
const listUseCase = new ListPatientsUseCase(patientRepo);
const addUseCase = new AddPatientUseCase(patientRepo);
const updateUseCase = new UpdatePatientUseCase(patientRepo);
const deleteUseCase = new DeletePatientUseCase(patientRepo);

export function usePatientsClean(): UsePatientsReturn {
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
      const result = await listUseCase.execute();
      setPatients(result);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      toast.error("Erro ao carregar pacientes: " + _e.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const addPatient = async (patientData: Partial<Patient>) => {
    try {
      const newPatient = await addUseCase.execute(patientData);
      setPatients((prev) => [...prev, newPatient]);
      toast.success("Paciente cadastrado com sucesso!");
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      toast.error("Erro ao cadastrar paciente: " + _e.message);
      throw error;
    }
  };

  const updatePatient = async (
    patientId: string,
    patientData: Partial<Patient>,
  ) => {
    try {
      const updated = await updateUseCase.execute(patientId, patientData);
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? updated : p)),
      );
      toast.success("Paciente atualizado com sucesso!");
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      toast.error("Erro ao atualizar paciente: " + _e.message);
      throw error;
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      await deleteUseCase.execute(patientId);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
      toast.success("Paciente removido com sucesso!");
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      toast.error("Erro ao remover paciente: " + _e.message);
      throw error;
    }
  };

  const getPatient = (patientId: string): Patient | undefined => {
    return patients.find((p) => p.id === patientId);
  };

  const reloadPatients = async () => {
    await loadPatients();
  };

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    reloadPatients,
  };
}
