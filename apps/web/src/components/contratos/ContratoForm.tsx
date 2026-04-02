import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import {
  contratoSchema,
  type Contrato,
} from "@/modules/contratos/types/contrato.types";

interface ContratoFormProps {
  onSubmit: (data: Omit<Contrato, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
  initialData?: Partial<Contrato>;
}

export function ContratoForm({
  onSubmit,
  onCancel,
  initialData,
}: ContratoFormProps) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient_id">Paciente *</Label>
          <Input
            id="patient_id"
            {...register("patient_id")}
            placeholder="ID do Paciente"
          />
          {errors.patient_id && (
            <p className="text-sm text-destructive">
              {errors.patient_id.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_contrato">Número do Contrato *</Label>
          <Input
            id="numero_contrato"
            {...register("numero_contrato")}
            placeholder="Ex: CTR-2024-001"
          />
          {errors.numero_contrato && (
            <p className="text-sm text-destructive">
              {errors.numero_contrato.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            {...register("titulo")}
            placeholder="Ex: Contrato de Tratamento Ortodôntico"
          />
          {errors.titulo && (
            <p className="text-sm text-destructive">{errors.titulo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="orcamento_id">Orçamento Relacionado</Label>
          <Input
            id="orcamento_id"
            {...register("orcamento_id")}
            placeholder="ID do Orçamento (opcional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template_id">Template</Label>
          <Input
            id="template_id"
            {...register("template_id")}
            placeholder="ID do Template (opcional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_contrato">Valor do Contrato (R$) *</Label>
          <Input
            id="valor_contrato"
            type="number"
            step="0.01"
            {...register("valor_contrato", { valueAsNumber: true })}
          />
          {errors.valor_contrato && (
            <p className="text-sm text-destructive">
              {errors.valor_contrato.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_inicio">Data de Início *</Label>
          <Input id="data_inicio" type="date" {...register("data_inicio")} />
          {errors.data_inicio && (
            <p className="text-sm text-destructive">
              {errors.data_inicio.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_termino">Data de Término</Label>
          <Input id="data_termino" type="date" {...register("data_termino")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) => setValue("status", value as unknown)}
            defaultValue={watch("status")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AGUARDANDO_ASSINATURA">
                Aguardando Assinatura
              </SelectItem>
              <SelectItem value="ASSINADO">Assinado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
              <SelectItem value="EXPIRADO">Expirado</SelectItem>
              <SelectItem value="CONCLUIDO">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <Checkbox
            id="renovacao_automatica"
            checked={watch("renovacao_automatica")}
            onCheckedChange={(checked) =>
              setValue("renovacao_automatica", checked as boolean)
            }
          />
          <Label htmlFor="renovacao_automatica" className="cursor-pointer">
            Renovação Automática
          </Label>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="conteudo_html">Conteúdo do Contrato (HTML) *</Label>
          <Textarea
            id="conteudo_html"
            {...register("conteudo_html")}
            placeholder="Conteúdo HTML do contrato..."
            rows={10}
            className="font-mono text-sm"
          />
          {errors.conteudo_html && (
            <p className="text-sm text-destructive">
              {errors.conteudo_html.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Contrato</Button>
      </div>
    </form>
  );
}
