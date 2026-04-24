import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { LeadFormData } from "./types";

interface ObservationsSectionProps {
  form: UseFormReturn<LeadFormData>;
}

export function ObservationsSection({ form }: ObservationsSectionProps) {
  const { register } = form;

  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="observacoes">Observações</Label>
      <Textarea
        id="observacoes"
        {...register("observacoes")}
        placeholder="Anotações sobre o lead..."
        rows={4}
      />
    </div>
  );
}
