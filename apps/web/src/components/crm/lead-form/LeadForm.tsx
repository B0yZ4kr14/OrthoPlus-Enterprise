import { Button } from "@orthoplus/core-ui/button";
import type { LeadFormProps } from "./types";
import { useLeadForm } from "./useLeadForm";
import { BasicInfoSection } from "./BasicInfoSection";
import { UTMSection } from "./UTMSection";
import { FunnelSection } from "./FunnelSection";
import { ObservationsSection } from "./ObservationsSection";

export function LeadForm({ onSubmit, onCancel, initialData }: LeadFormProps) {
  const form = useLeadForm({ initialData });
  const { handleSubmit } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BasicInfoSection form={form} />
        <UTMSection form={form} />
        <FunnelSection form={form} />
        <ObservationsSection form={form} />
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
