// cspell:disable
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useSplit } from "@/modules/split-pagamento/hooks/useSplit";
import { DEFAULT_FORM_DATA } from "./constants";
import type { SplitConfigFormData, SplitConfigFormProps } from "./types";

const splitConfigSchema = z
  .object({
    dentist_id: z.string().uuid("Selecione um dentista válido"),
    procedimento_id: z
      .string()
      .uuid("Selecione um procedimento")
      .optional()
      .nullable(),
    percentual_dentista: z.number().min(0).max(100),
    percentual_clinica: z.number().min(0).max(100),
    tipo_split: z.enum(["PROCEDIMENTO", "GLOBAL"]),
    ativo: z.boolean(),
  })
  .refine(
    (data) => data.percentual_dentista + data.percentual_clinica === 100,
    {
      message: "A soma dos percentuais deve ser 100%",
      path: ["percentual_clinica"],
    },
  );

export function useSplitConfigForm(
  editingConfig: SplitConfigFormProps["editingConfig"],
  onOpenChange: (open: boolean) => void
) {
  const { createConfig, updateConfig } = useSplit();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SplitConfigFormData>>({
    dentist_id: editingConfig?.dentist_id || "",
    procedimento_id: editingConfig?.procedimento_id || null,
    percentual_dentista: editingConfig?.percentual_dentista || 50,
    percentual_clinica: editingConfig?.percentual_clinica || 50,
    tipo_split: editingConfig?.tipo_split || "PROCEDIMENTO",
    ativo: editingConfig?.ativo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = splitConfigSchema.parse({
        ...formData,
        percentual_dentista: Number(formData.percentual_dentista),
        percentual_clinica: Number(formData.percentual_clinica),
      });

      if (editingConfig) {
        await updateConfig(editingConfig.id, validated);
      } else {
        await createConfig(validated);
      }

      onOpenChange(false);
      setFormData(DEFAULT_FORM_DATA);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error((error.issues as any)[0].message);
      } else {
        toast.error("Erro ao salvar configuração de split");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePercentualDentistaChange = (value: number) => {
    setFormData({
      ...formData,
      percentual_dentista: value,
      percentual_clinica: 100 - value,
    });
  };

  const handleInputChange = <K extends keyof SplitConfigFormData>(
    field: K,
    value: SplitConfigFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    loading,
    handleSubmit,
    handlePercentualDentistaChange,
    handleInputChange,
  };
}
