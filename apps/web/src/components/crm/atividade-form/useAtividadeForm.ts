import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AtividadeFormData, AtividadeFormProps } from "./types";

const atividadeSchema = z.object({
  tipo: z.enum(["LIGACAO", "EMAIL", "REUNIAO", "WHATSAPP", "VISITA", "OUTRO"]),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  dataAgendada: z.string().optional(),
});

export function useAtividadeForm(onSubmit: AtividadeFormProps["onSubmit"]) {
  const form = useForm<AtividadeFormData>({
    resolver: zodResolver(atividadeSchema),
    defaultValues: {
      tipo: "LIGACAO",
      titulo: "",
      descricao: "",
      dataAgendada: "",
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return {
    form,
    handleSubmit,
  };
}
