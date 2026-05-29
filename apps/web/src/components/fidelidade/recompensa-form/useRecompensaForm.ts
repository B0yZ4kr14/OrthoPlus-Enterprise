// cspell:disable
import { useState, useEffect } from "react";
import { z } from "zod";
import { useFidelidade } from "@/modules/fidelidade/hooks/useFidelidade";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { DEFAULT_FORM_DATA } from "./constants";
import type { RecompensaFormData, RecompensaFormProps } from "./types";

const recompensaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  pontos_necessarios: z
    .number()
    .min(1, "Pontos necessários deve ser pelo menos 1"),
  tipo: z.enum([
    "BRINDE",
    "DESCONTO_PERCENTUAL",
    "DESCONTO_VALOR",
    "PROCEDIMENTO_GRATIS",
  ]),
  valor_desconto: z.number().optional().nullable(),
  procedimento_id: z.string().uuid().optional().nullable(),
  ativo: z.boolean(),
});

export function useRecompensaForm({
  editingRecompensa,
  onSuccess,
}: RecompensaFormProps) {
  const { createRecompensa, updateRecompensa } = useFidelidade();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] =
    useState<RecompensaFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    if (editingRecompensa) {
      setFormData({
        nome: editingRecompensa.nome,
        descricao: editingRecompensa.descricao || "",
        pontos_necessarios: editingRecompensa.pontos_necessarios,
        tipo: editingRecompensa.tipo,
        valor_desconto: editingRecompensa.valor_desconto,
        procedimento_id: editingRecompensa.procedimento_id,
        ativo: editingRecompensa.ativo,
      });
    }
  }, [editingRecompensa]);

  const handleInputChange = (
    field: keyof RecompensaFormData,
    value: unknown,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const result = recompensaSchema.safeParse(formData);
    if (!result.success) {
      const firstError = (result.error.issues as Array<{ message: string }>)[0];
      toast.error(firstError.message);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      if (editingRecompensa) {
        await updateRecompensa(editingRecompensa.id, formData);
        toast.success("Recompensa atualizada com sucesso!");
      } else {
        await createRecompensa(formData);
        toast.success("Recompensa criada com sucesso!");
      }

      onSuccess?.();

      if (!editingRecompensa) {
        setFormData(DEFAULT_FORM_DATA);
      }
    } catch (error) {
      logger.error("Erro ao salvar recompensa:", error);
      toast.error("Erro ao salvar recompensa");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSubmit,
  };
}
