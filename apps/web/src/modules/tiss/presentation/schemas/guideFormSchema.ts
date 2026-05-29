import { z } from "zod";

export const guideFormSchema = z.object({
  patient_id: z.string().uuid({ message: "Selecione um paciente" }),
  insurance_company: z.string().min(1, { message: "Selecione um convênio" }),
  guide_number: z
    .string()
    .min(1, { message: "Número da guia é obrigatório" })
    .max(50),
  procedure_code: z.string().min(1, { message: "Selecione um procedimento" }),
  procedure_name: z.string().min(1),
  amount: z
    .string()
    .min(1, { message: "Valor é obrigatório" })
    .refine((val) => !isNaN(parseFloat(val.replace(",", "."))), {
      message: "Valor inválido",
    }),
  service_date: z
    .string()
    .min(1, { message: "Data do atendimento é obrigatória" }),
  status: z.string().optional(),
});

export type GuideFormData = z.infer<typeof guideFormSchema>;
