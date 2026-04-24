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

interface TituloInputProps {
  form: UseFormReturn<AtividadeFormData>;
}

export function TituloInput({ form }: TituloInputProps) {
  return (
    <FormField
      control={form.control}
      name="titulo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Título</FormLabel>
          <FormControl>
            <Input placeholder="Ex: Ligação de follow-up" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
