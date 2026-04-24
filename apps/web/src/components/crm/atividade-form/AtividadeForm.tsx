import { Form } from "@orthoplus/core-ui/form";
import type { AtividadeFormProps } from "./types";
import { useAtividadeForm } from "./useAtividadeForm";
import { TipoSelect } from "./TipoSelect";
import { TituloInput } from "./TituloInput";
import { DescricaoTextarea } from "./DescricaoTextarea";
import { DataAgendadaInput } from "./DataAgendadaInput";
import { FormActions } from "./FormActions";

export function AtividadeForm({ onSubmit, onCancel }: AtividadeFormProps) {
  const { form, handleSubmit } = useAtividadeForm(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TipoSelect form={form} />
        <TituloInput form={form} />
        <DescricaoTextarea form={form} />
        <DataAgendadaInput form={form} />
        <FormActions onCancel={onCancel} />
      </form>
    </Form>
  );
}
