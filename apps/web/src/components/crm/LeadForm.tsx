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
import { z } from "zod";

const leadSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  origem: z.string().min(1, "Origem é obrigatória"),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  interesse: z.string().optional(),
  status_funil: z.enum([
    "NOVO",
    "CONTATO_INICIAL",
    "QUALIFICADO",
    "PROPOSTA_ENVIADA",
    "NEGOCIACAO",
    "CONVERTIDO",
    "PERDIDO",
  ]),
  temperatura: z.enum(["FRIO", "MORNO", "QUENTE"]),
  valor_estimado: z.number().optional(),
  observacoes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  onCancel: () => void;
  initialData?: Partial<LeadFormData>;
}

export function LeadForm({ onSubmit, onCancel, initialData }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      ...initialData,
      status_funil: initialData?.status_funil || "NOVO",
      temperatura: initialData?.temperatura || "FRIO",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input id="nome" {...register("nome")} placeholder="Ex: João Silva" />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="joao@email.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            {...register("telefone")}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            {...register("whatsapp")}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="origem">Origem *</Label>
          <Select
            onValueChange={(value) => setValue("origem", value)}
            defaultValue={watch("origem")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SITE">Site</SelectItem>
              <SelectItem value="INSTAGRAM">Instagram</SelectItem>
              <SelectItem value="FACEBOOK">Facebook</SelectItem>
              <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
              <SelectItem value="INDICACAO">Indicação</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="TELEFONE">Telefone</SelectItem>
              <SelectItem value="OUTROS">Outros</SelectItem>
            </SelectContent>
          </Select>
          {errors.origem && (
            <p className="text-sm text-destructive">{errors.origem.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="utm_source">UTM Source</Label>
          <Input
            id="utm_source"
            {...register("utm_source")}
            placeholder="Ex: google"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="utm_medium">UTM Medium</Label>
          <Input
            id="utm_medium"
            {...register("utm_medium")}
            placeholder="Ex: cpc"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="utm_campaign">UTM Campaign</Label>
          <Input
            id="utm_campaign"
            {...register("utm_campaign")}
            placeholder="Ex: ortodontia-2024"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="interesse">Interesse/Tratamento</Label>
          <Input
            id="interesse"
            {...register("interesse")}
            placeholder="Ex: Aparelho Ortodôntico, Clareamento..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status_funil">Status no Funil *</Label>
          <Select
            onValueChange={(value) =>
              setValue("status_funil", value as unknown)
            }
            defaultValue={watch("status_funil")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOVO">Novo Lead</SelectItem>
              <SelectItem value="CONTATO_INICIAL">Contato Inicial</SelectItem>
              <SelectItem value="QUALIFICADO">Qualificado</SelectItem>
              <SelectItem value="PROPOSTA_ENVIADA">Proposta Enviada</SelectItem>
              <SelectItem value="NEGOCIACAO">Em Negociação</SelectItem>
              <SelectItem value="CONVERTIDO">Convertido</SelectItem>
              <SelectItem value="PERDIDO">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperatura">Temperatura *</Label>
          <Select
            onValueChange={(value) => setValue("temperatura", value as unknown)}
            defaultValue={watch("temperatura")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FRIO">🥶 Frio</SelectItem>
              <SelectItem value="MORNO">😐 Morno</SelectItem>
              <SelectItem value="QUENTE">🔥 Quente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
          <Input
            id="valor_estimado"
            type="number"
            step="0.01"
            {...register("valor_estimado", { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register("observacoes")}
            placeholder="Anotações sobre o lead..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Lead</Button>
      </div>
    </form>
  );
}
