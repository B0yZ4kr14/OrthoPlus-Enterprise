// cspell:disable
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOdontograma } from "@/modules/pep/hooks/useOdontograma";
import { useTratamentos } from "@/modules/pep/hooks/useTratamentos";
import type { Patient } from "@/types/patient";
import type { TabValue, DialogState, AISuggestion } from "./types";

export function usePEPPage() {
  const { user, clinicId } = useAuth();
  const { toast } = useToast();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("historico");
  const [dialogs, setDialogs] = useState<DialogState>({
    historico: false,
    tratamento: false,
    prescricao: false,
    receita: false,
  });
  const [selectedForComparison, setSelectedForComparison] = useState<
    [string | null, string | null]
  >([null, null]);

  const prontuarioId = selectedPatient?.id || null;

  const { createTratamento } = useTratamentos(prontuarioId, clinicId || "");
  const { history, restoreFromHistory } = useOdontograma(prontuarioId || "");

  const setDialogOpen = useCallback((key: keyof DialogState, open: boolean) => {
    setDialogs((prev) => ({ ...prev, [key]: open }));
  }, []);

  const handleCompareSelect = useCallback((historyId: string) => {
    setSelectedForComparison((prev) => {
      if (prev[0] === historyId || prev[1] === historyId) {
        return [null, null];
      }
      if (prev[0] === null) {
        return [historyId, null];
      }
      if (prev[1] === null) {
        setActiveTab("comparacao-odonto");
        return [prev[0], historyId];
      }
      return [historyId, null];
    });
  }, []);

  const handleClearComparison = useCallback(() => {
    setSelectedForComparison([null, null]);
    setActiveTab("historico-odonto");
  }, []);

  const handleCreateTreatmentsFromAI = useCallback(
    async (suggestions: AISuggestion[]) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      try {
        for (const suggestion of suggestions) {
          await createTratamento({
            titulo: suggestion.procedure,
            descricao:
              suggestion.clinical_notes ||
              `Tratamento para o dente ${suggestion.tooth_number}`,
            denteCodigo: suggestion.tooth_number,
            dataInicio: new Date(),
            createdBy: user.id,
          } as Parameters<typeof createTratamento>[0]);
        }

        toast({
          title: "Sucesso",
          description: `${suggestions.length} tratamento(s) criado(s) com sucesso`,
        });

        setActiveTab("tratamentos");
      } catch (error: unknown) {
        toast({
          title: "Erro ao criar tratamentos",
          description: error instanceof Error ? error.message : "Erro",
          variant: "destructive",
        });
      }
    },
    [user, createTratamento, toast],
  );

  return {
    user,
    clinicId,
    selectedPatient,
    setSelectedPatient,
    activeTab,
    setActiveTab,
    dialogs,
    setDialogOpen,
    selectedForComparison,
    handleCompareSelect,
    handleClearComparison,
    handleCreateTreatmentsFromAI,
    prontuarioId,
    history,
    restoreFromHistory,
    toast,
  };
}
