import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { useLeads } from "@/hooks/useLeads";
import { Lead, LeadSource } from "@/modules/crm/domain/entities/Lead";

const leadSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().min(10, "Telefone inválido"),
  origem: z.enum([
    "SITE",
    "TELEFONE",
    "INDICACAO",
    "REDES_SOCIAIS",
    "EVENTO",
    "OUTRO",
  ]),
  interesseDescricao: z.string().optional(),
  valorEstimado: z.number().min(0).optional(),
  observacoes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  lead?: Lead;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LeadForm = ({ lead, onSuccess, onCancel }: LeadFormProps) => {
  const { createLead, updateLead } = useLeads();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: lead?.nome || "",
      email: lead?.email || "",
      telefone: lead?.telefone || "",
      origem: lead?.origem || "SITE",
      interesseDescricao: lead?.interesseDescricao || "",
      valorEstimado: lead?.valorEstimado || 0,
      observacoes: lead?.observacoes || "",
    },
  });

  const origem = watch("origem");

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsSubmitting(true);
      if (lead) {
        await updateLead(lead.id, {
          nome: data.nome,
          email: data.email || undefined,
          telefone: data.telefone,
          origem: data.origem,
          valorEstimado: data.valorEstimado,
          interesseDescricao: data.interesseDescricao,
          observacoes: data.observacoes,
        });
      } else {
        await createLead({
          nome: data.nome,
          email: data.email || undefined,
          telefone: data.telefone,
          origem: data.origem,
          valorEstimado: data.valorEstimado,
          interesseDescricao: data.interesseDescricao,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register("nome")} placeholder="Nome completo" />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            {...register("telefone")}
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && (
            <p className="text-sm text-destructive">
              {errors.telefone.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="email@exemplo.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="origem">Origem *</Label>
          <Select
            value={origem}
            onValueChange={(value) => setValue("origem", value as LeadSource)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SITE">Site</SelectItem>
              <SelectItem value="TELEFONE">Telefone</SelectItem>
              <SelectItem value="INDICACAO">Indicação</SelectItem>
              <SelectItem value="REDES_SOCIAIS">Redes Sociais</SelectItem>
              <SelectItem value="EVENTO">Evento</SelectItem>
              <SelectItem value="OUTRO">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interesseDescricao">Interesse</Label>
          <Input
            id="interesseDescricao"
            {...register("interesseDescricao")}
            placeholder="Ex: Implante, Ortodontia..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorEstimado">Valor Estimado (R$)</Label>
          <Input
            id="valorEstimado"
            type="number"
            step="0.01"
            {...register("valorEstimado", { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register("observacoes")}
          placeholder="Informações adicionais sobre o lead..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : lead
              ? "Salvar Alterações"
              : "Criar Lead"}
        </Button>
      </div>
    </form>
  );
};
