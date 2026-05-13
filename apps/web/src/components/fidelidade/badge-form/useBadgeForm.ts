import { useState, useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useFidelidade } from "@/modules/fidelidade/hooks/useFidelidade";
import type { BadgeFormData, CriterioTipo } from "./types";
import { badgeSchema } from "./types";

const INITIAL_FORM_DATA: Partial<BadgeFormData> = {
  nome: "",
  descricao: "",
  icone: "🎯",
  criterio_tipo: "pontos_totais",
  criterio_valor: 100,
  compartilhavel: true,
};

export function useBadgeForm(onOpenChange: (open: boolean) => void) {
  const { createBadge } = useFidelidade();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BadgeFormData>>(INITIAL_FORM_DATA);

  const updateField = useCallback(<K extends keyof BadgeFormData>(
    field: K,
    value: BadgeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateCriterioTipo = useCallback((tipo: CriterioTipo) => {
    setFormData((prev) => ({
      ...prev,
      criterio_tipo: tipo,
      criterio_valor: tipo === "pontos_totais" ? 100 : "BRONZE",
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = badgeSchema.parse(formData);
      await createBadge(validated);

      onOpenChange(false);
      resetForm();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error((error.issues as any)[0].message);
      } else {
        toast.error("Erro ao criar badge");
      }
    } finally {
      setLoading(false);
    }
  }, [formData, createBadge, onOpenChange, resetForm]);

  return {
    formData,
    loading,
    updateField,
    updateCriterioTipo,
    submit,
  };
}
