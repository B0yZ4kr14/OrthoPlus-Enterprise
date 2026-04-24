// cspell:disable
import { z } from "zod";

export const splitConfigSchema = z
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

export type SplitConfigFormData = z.infer<typeof splitConfigSchema>;

export interface Dentista {
  id: string;
  nome: string;
}

export interface Procedimento {
  id: string;
  nome: string;
}

export interface SplitConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dentistas: Dentista[];
  procedimentos: Procedimento[];
  editingConfig?: Record<string, any>;
}
