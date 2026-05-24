import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Textarea } from "@orthoplus/core-ui/textarea";
import type { DentalTabProps } from "./types";

export function ObservationsField({ form }: DentalTabProps) {
  return (
    <FormField
      control={form.control}
      name="clinical_observations"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Observações Clínicas</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Observações gerais sobre a condição odontológica do paciente..."
              className="min-h-[120px]"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
