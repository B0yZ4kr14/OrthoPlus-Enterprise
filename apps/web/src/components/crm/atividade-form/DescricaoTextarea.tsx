import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Textarea } from "@orthoplus/core-ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import type { AtividadeFormData } from "./types";

interface DescricaoTextareaProps {
  form: UseFormReturn<AtividadeFormData>;
}

export function DescricaoTextarea({ form }: DescricaoTextareaProps) {
  return (
    <FormField
      control={form.control}
      name="descricao"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição (opcional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Detalhes da atividade..."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
