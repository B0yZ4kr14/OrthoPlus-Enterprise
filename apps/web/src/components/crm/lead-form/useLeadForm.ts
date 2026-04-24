import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadFormData } from "./types";

interface UseLeadFormProps {
  initialData?: Partial<LeadFormData>;
}

export function useLeadForm({ initialData }: UseLeadFormProps = {}) {
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      whatsapp: "",
      origem: "",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      interesse: "",
      status_funil: "NOVO",
      temperatura: "FRIO",
      valor_estimado: undefined,
      observacoes: "",
      ...initialData,
    },
  });

  return form;
}
