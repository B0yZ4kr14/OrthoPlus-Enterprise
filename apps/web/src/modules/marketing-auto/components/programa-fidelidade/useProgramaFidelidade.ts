// cspell:disable
import { useState, useCallback } from "react";
import { useFidelidade } from "@/modules/fidelidade/hooks/useFidelidade";
import { FidelidadeRecompensa } from "@/modules/fidelidade/types/fidelidade.types";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export function useProgramaFidelidade() {
  const { pontos, recompensas, badges, indicacoes, loading } = useFidelidade();
  const [recompensaFormOpen, setRecompensaFormOpen] = useState(false);
  const [badgeFormOpen, setBadgeFormOpen] = useState(false);
  const [editingRecompensa, setEditingRecompensa] =
    useState<FidelidadeRecompensa | null>(null);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"],
    });
  }, []);

  const handleShareBadge = useCallback(async (badgeName: string) => {
    const shareText = `🏆 Acabei de conquistar o badge "${badgeName}" no meu programa de fidelidade odontológico! #OrthoPlus Enterprise #Saúde`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        toast.success("Badge compartilhado com sucesso!");
      } catch (error) {
        // Sharing cancelled or unavailable — no action needed
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Texto copiado para a área de transferência!");
    }
  }, []);

  const handleEditRecompensa = useCallback(
    (recompensa: FidelidadeRecompensa) => {
      setEditingRecompensa(recompensa);
      setRecompensaFormOpen(true);
    },
    [],
  );

  const handleCloseRecompensaForm = useCallback(() => {
    setRecompensaFormOpen(false);
    setEditingRecompensa(null);
  }, []);

  return {
    pontos,
    recompensas,
    badges,
    indicacoes,
    loading,
    recompensaFormOpen,
    badgeFormOpen,
    editingRecompensa,
    setRecompensaFormOpen,
    setBadgeFormOpen,
    triggerConfetti,
    handleShareBadge,
    handleEditRecompensa,
    handleCloseRecompensaForm,
  };
}
