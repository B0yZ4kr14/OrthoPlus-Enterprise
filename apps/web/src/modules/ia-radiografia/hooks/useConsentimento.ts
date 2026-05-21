import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { useCallback, useState } from "react";

export interface ConsentimentoStatus {
  ativo: boolean;
  historico: Array<{
    id: string;
    paciente_id: string;
    clinic_id: string;
    consentido: boolean;
    data_consentimento: string;
    revogado: boolean;
    created_at: string;
  }>;
}

export const useConsentimento = () => {
  const [loading, setLoading] = useState(false);
  const { user, clinicId } = useAuth();
  const { toast } = useToast();

  const verificarConsentimento = useCallback(
    async (pacienteId: string): Promise<ConsentimentoStatus | null> => {
      try {
        if (!user || !clinicId) return null;
        const result = await apiClient.get<ConsentimentoStatus>(
          `/ia-radiografia/consentimento/${pacienteId}`,
        );
        return result;
      } catch (error) {
        console.error("Erro ao verificar consentimento:", error);
        return null;
      }
    },
    [user, clinicId],
  );

  const registrarConsentimento = useCallback(
    async (pacienteId: string, hashTermo?: string) => {
      try {
        if (!user || !clinicId) throw new Error("Não autenticado");
        setLoading(true);

        const result = await apiClient.post(`/ia-radiografia/consentimento`, {
          paciente_id: pacienteId,
          consentido: true,
          hash_termo: hashTermo || `default-${Date.now()}`,
        });

        toast({
          title: "Consentimento registrado",
          description: "Paciente pode agora enviar radiografias para análise IA",
        });

        return result;
      } catch (error) {
        console.error("Erro ao registrar consentimento:", error);
        toast({
          title: "Erro ao registrar consentimento",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, clinicId, toast],
  );

  const revogarConsentimento = useCallback(
    async (pacienteId: string, motivo?: string) => {
      try {
        if (!user || !clinicId) throw new Error("Não autenticado");
        setLoading(true);

        const result = await apiClient.delete(
          `/ia-radiografia/consentimento/${pacienteId}`,
          { data: { motivo: motivo || "Revogação pelo paciente" } },
        );

        toast({
          title: "Consentimento revogado",
          description: "Paciente não poderá mais enviar radiografias para IA",
        });

        return result;
      } catch (error) {
        console.error("Erro ao revogar consentimento:", error);
        toast({
          title: "Erro ao revogar consentimento",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, clinicId, toast],
  );

  return {
    loading,
    verificarConsentimento,
    registrarConsentimento,
    revogarConsentimento,
  };
};
