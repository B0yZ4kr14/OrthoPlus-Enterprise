import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PatientSelector } from "@/components/shared/PatientSelector";
import type { Patient } from "@/types/patient";
import { tipoPlanoLabels } from "../../types/orcamento.types";

const formSchema = z.object({
  patient_id: z.string().uuid("Selecione um paciente"),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  tipo_plano: z.enum(["BASICO", "INTERMEDIARIO", "PREMIUM"]),
  valor_total: z.number().min(0, "Valor deve ser positivo"),
  desconto_percentual: z.number().min(0).max(100),
  desconto_valor: z.number().min(0),
  validade_dias: z.number().min(1),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OrcamentoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clinicId, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      tipo_plano: "BASICO",
      valor_total: 0,
      desconto_percentual: 0,
      desconto_valor: 0,
      validade_dias: 30,
      observacoes: "",
    },
  });

  // Carregar dados se estiver editando
  useEffect(() => {
    if (!id) return;

    const fetchOrcamento = async () => {
      try {
        setIsFetching(true);
        const data = await apiClient.get<Record<string, any>>(
          `/orcamentos/${id}`,
        );
        if (data) {
          form.reset({
            patient_id: data.patient_id,
            titulo: data.titulo,
            descricao: data.descricao || "",
            tipo_plano: data.tipo_plano,
            valor_total: data.valor_total / 100, // centavos → reais
            desconto_percentual: data.desconto_percentual || 0,
            desconto_valor: (data.desconto_valor || 0) / 100,
            validade_dias: data.validade_dias || 30,
            observacoes: data.observacoes || "",
          });
        }
      } catch {
        toast.error("Erro ao carregar orçamento");
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrcamento();
  }, [id, form]);

  const onSubmit = async (values: FormValues) => {
    if (!clinicId || !user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        numero_orcamento: id ? undefined : `ORC-${Date.now()}`,
        valor_total: Math.round(values.valor_total * 100), // reais → centavos
        desconto_valor: Math.round(values.desconto_valor * 100),
        clinic_id: clinicId,
        created_by: user.id,
      };

      if (id) {
        await apiClient.put(`/orcamentos/${id}`, payload);
        toast.success("Orçamento atualizado com sucesso!");
      } else {
        await apiClient.post("/orcamentos", payload);
        toast.success("Orçamento criado com sucesso!");
      }
      navigate("/orcamentos");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Erro ao salvar orçamento";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">Carregando...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={id ? "Editar Orcamento" : "Novo Orcamento"}
        description="Preencha os dados do orcamento para o paciente"
        icon={FileText}
        actions={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orcamentos")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Paciente */}
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <PatientSelector
                selectedPatient={selectedPatient}
                onSelect={(patient) => {
                  setSelectedPatient(patient);
                  if (patient) {
                    form.setValue("patient_id", patient.id);
                  }
                }}
              />
              {form.formState.errors.patient_id && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.patient_id.message}
                </p>
              )}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                {...form.register("titulo")}
                placeholder="Ex: Tratamento Ortodôntico Completo"
              />
              {form.formState.errors.titulo && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.titulo.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                {...form.register("descricao")}
                placeholder="Detalhes do tratamento proposto"
                rows={3}
              />
            </div>

            {/* Tipo de Plano */}
            <div className="space-y-2">
              <Label htmlFor="tipo_plano">Tipo de Plano *</Label>
              <Select
                value={form.watch("tipo_plano")}
                onValueChange={(v) =>
                  form.setValue(
                    "tipo_plano",
                    v as "BASICO" | "INTERMEDIARIO" | "PREMIUM",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoPlanoLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valor e Desconto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_total">Valor Total (R$) *</Label>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  min={0}
                  {...form.register("valor_total", { valueAsNumber: true })}
                />
                {form.formState.errors.valor_total && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.valor_total.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="desconto_percentual">Desconto (%)</Label>
                <Input
                  id="desconto_percentual"
                  type="number"
                  min={0}
                  max={100}
                  {...form.register("desconto_percentual", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desconto_valor">Desconto (R$)</Label>
                <Input
                  id="desconto_valor"
                  type="number"
                  step="0.01"
                  min={0}
                  {...form.register("desconto_valor", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Validade */}
            <div className="space-y-2">
              <Label htmlFor="validade_dias">Validade (dias) *</Label>
              <Input
                id="validade_dias"
                type="number"
                min={1}
                {...form.register("validade_dias", { valueAsNumber: true })}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...form.register("observacoes")}
                placeholder="Informações adicionais"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/orcamentos")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : id ? "Atualizar" : "Criar Orçamento"}
          </Button>
        </div>
      </form>
    </div>
  );
}
