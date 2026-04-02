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
import { Card } from "@orthoplus/core-ui/card";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { useConfetti } from "@/hooks/useConfetti";

const orcamentoItemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  procedimento_id: z.string().optional(),
  quantidade: z.number().min(1, "Mínimo 1"),
  valor_unitario: z.number().min(0, "Valor deve ser positivo"),
  dente_codigo: z.string().optional(),
  observacoes: z.string().optional(),
});

const orcamentoSchema = z.object({
  patient_id: z.string().uuid("Selecione um paciente"),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  tipo_plano: z.enum(["BASICO", "INTERMEDIARIO", "PREMIUM"]),
  validade_dias: z.number().min(1).default(30),
  desconto_percentual: z.number().min(0).max(100).default(0),
  desconto_valor: z.number().min(0).default(0),
  observacoes: z.string().optional(),
  itens: z.array(orcamentoItemSchema).min(1, "Adicione pelo menos um item"),
});

type OrcamentoFormData = z.infer<typeof orcamentoSchema>;

interface OrcamentoFormProps {
  onSubmit: (data: OrcamentoFormData) => void;
  onCancel: () => void;
  initialData?: Partial<OrcamentoFormData>;
}

export function OrcamentoForm({
  onSubmit,
  onCancel,
  initialData,
}: OrcamentoFormProps) {
  const { triggerCelebrationConfetti } = useConfetti();
  const [itens, setItens] = useState(
    initialData?.itens || [{ descricao: "", quantidade: 1, valor_unitario: 0 }],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrcamentoFormData>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      ...initialData,
      tipo_plano: initialData?.tipo_plano || "BASICO",
      validade_dias: initialData?.validade_dias || 30,
      desconto_percentual: initialData?.desconto_percentual || 0,
      desconto_valor: initialData?.desconto_valor || 0,
      itens: itens,
    },
  });

  const addItem = () => {
    const newItens = [
      ...itens,
      { descricao: "", quantidade: 1, valor_unitario: 0 },
    ];
    setItens(newItens);
    setValue("itens", newItens);
  };

  const removeItem = (index: number) => {
    const newItens = itens.filter((_, i) => i !== index);
    setItens(newItens);
    setValue("itens", newItens);
  };

  const updateItem = (index: number, field: string, value: unknown) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setItens(newItens);
    setValue("itens", newItens);
  };

  const valorTotal = itens.reduce(
    (acc, item) => acc + item.quantidade * item.valor_unitario,
    0,
  );
  const descontoPerc = watch("desconto_percentual") || 0;
  const descontoVal = watch("desconto_valor") || 0;
  const valorFinal =
    valorTotal - (valorTotal * descontoPerc) / 100 - descontoVal;

  const handleFormSubmit = (data: OrcamentoFormData) => {
    onSubmit(data);
    // Trigger celebration confetti for budget approval
    triggerCelebrationConfetti();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
          <Label htmlFor="tipo_plano">Tipo de Plano *</Label>
          <Select
            onValueChange={(value) => setValue("tipo_plano", value as unknown)}
            defaultValue={watch("tipo_plano")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BASICO">Básico</SelectItem>
              <SelectItem value="INTERMEDIARIO">Intermediário</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            {...register("titulo")}
            placeholder="Ex: Tratamento Ortodôntico Completo"
          />
          {errors.titulo && (
            <p className="text-sm text-destructive">{errors.titulo.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            {...register("descricao")}
            placeholder="Descrição detalhada do orçamento"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validade_dias">Validade (dias) *</Label>
          <Input
            id="validade_dias"
            type="number"
            {...register("validade_dias", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desconto_percentual">Desconto (%)</Label>
          <Input
            id="desconto_percentual"
            type="number"
            step="0.01"
            {...register("desconto_percentual", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desconto_valor">Desconto (R$)</Label>
          <Input
            id="desconto_valor"
            type="number"
            step="0.01"
            {...register("desconto_valor", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Itens do Orçamento *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {itens.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição *</Label>
                <Input
                  value={item.descricao}
                  onChange={(e) =>
                    updateItem(index, "descricao", e.target.value)
                  }
                  placeholder="Procedimento/Serviço"
                />
              </div>

              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "quantidade",
                      parseInt(e.target.value) || 1,
                    )
                  }
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Valor Unit. *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.valor_unitario}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "valor_unitario",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Dente</Label>
                <Input
                  value={item.dente_codigo || ""}
                  onChange={(e) =>
                    updateItem(index, "dente_codigo", e.target.value)
                  }
                  placeholder="Ex: 11"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Observações</Label>
                <Input
                  value={item.observacoes || ""}
                  onChange={(e) =>
                    updateItem(index, "observacoes", e.target.value)
                  }
                  placeholder="Observações adicionais"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={itens.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 text-sm font-medium text-right">
              Subtotal: R$ {(item.quantidade * item.valor_unitario).toFixed(2)}
            </div>
          </Card>
        ))}
        {errors.itens && (
          <p className="text-sm text-destructive">{errors.itens.message}</p>
        )}
      </div>

      <Card className="p-4 bg-muted">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Valor Total:</span>
            <span className="font-bold">R$ {valorTotal.toFixed(2)}</span>
          </div>
          {descontoPerc > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Desconto ({descontoPerc}%):</span>
              <span>- R$ {((valorTotal * descontoPerc) / 100).toFixed(2)}</span>
            </div>
          )}
          {descontoVal > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Desconto (valor):</span>
              <span>- R$ {descontoVal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Valor Final:</span>
            <span>R$ {valorFinal.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações Gerais</Label>
        <Textarea
          id="observacoes"
          {...register("observacoes")}
          placeholder="Condições, garantias, etc."
          rows={3}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Orçamento</Button>
      </div>
    </form>
  );
}
