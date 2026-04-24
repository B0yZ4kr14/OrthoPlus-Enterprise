import { Button } from "@orthoplus/core-ui/button";
import type { ContratoFormProps } from "../types";
import { useContratoForm } from "../useContratoForm";
import { FormField } from "../FormField";
import { StatusSelect } from "../StatusSelect";
import { RenovacaoCheckbox } from "../RenovacaoCheckbox";
import { ContentTextarea } from "../ContentTextarea";

export * from "../types";
export { FormField, StatusSelect, RenovacaoCheckbox, ContentTextarea };

export function ContratoForm({
  onSubmit,
  onCancel,
  initialData,
}: ContratoFormProps) {
  const { register, handleSubmit, errors, setValue, watch } = useContratoForm(
    onSubmit,
    initialData
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="patient_id"
          label="Paciente"
          placeholder="ID do Paciente"
          register={register}
          error={errors.patient_id}
          required
        />

        <FormField
          id="numero_contrato"
          label="Número do Contrato"
          placeholder="Ex: CTR-2024-001"
          register={register}
          error={errors.numero_contrato}
          required
        />

        <div className="space-y-2 md:col-span-2">
          <FormField
            id="titulo"
            label="Título"
            placeholder="Ex: Contrato de Tratamento Ortodôntico"
            register={register}
            error={errors.titulo}
            required
          />
        </div>

        <FormField
          id="orcamento_id"
          label="Orçamento Relacionado"
          placeholder="ID do Orçamento (opcional)"
          register={register}
        />

        <FormField
          id="template_id"
          label="Template"
          placeholder="ID do Template (opcional)"
          register={register}
        />

        <FormField
          id="valor_contrato"
          label="Valor do Contrato (R$)"
          type="number"
          register={register}
          error={errors.valor_contrato}
          required
        />

        <FormField
          id="data_inicio"
          label="Data de Início"
          type="date"
          register={register}
          error={errors.data_inicio}
          required
        />

        <FormField
          id="data_termino"
          label="Data de Término"
          type="date"
          register={register}
        />

        <StatusSelect
          value={watch("status")}
          onChange={(value) => setValue("status", value)}
        />

        <div className="flex items-center md:col-span-2">
          <RenovacaoCheckbox
            checked={watch("renovacao_automatica")}
            onChange={(checked) => setValue("renovacao_automatica", checked)}
          />
        </div>

        <div className="md:col-span-2">
          <ContentTextarea register={register} error={errors.conteudo_html} />
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
