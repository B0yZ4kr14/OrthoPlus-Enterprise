import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contratoSchema,
  type Contrato,
} from "@/modules/contratos/types/contrato.types";
import type { ContratoFormProps } from "./types";

export function useContratoForm(
  onSubmit: ContratoFormProps["onSubmit"],
  initialData?: Partial<Contrato>
) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      ...initialData,
      renovacao_automatica: initialData?.renovacao_automatica || false,
      status: initialData?.status || "AGUARDANDO_ASSINATURA",
    },
  });

  return {
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
  };
}
