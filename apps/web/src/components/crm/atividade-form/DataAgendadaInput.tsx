import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { AtividadeFormData } from "./types";

interface DataAgendadaInputProps {
  form: UseFormReturn<AtividadeFormData>;
}

export function DataAgendadaInput({ form }: DataAgendadaInputProps) {
  return (
    <FormField
      control={form.control}
      name="dataAgendada"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Data e Hora Agendada (opcional)</FormLabel>
          <FormControl>
            <Input type="datetime-local" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
