import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@orthoplus/core-ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { AtividadeFormData } from "./types";
import { TIPO_LABELS } from "./types";

interface TipoSelectProps {
  form: UseFormReturn<AtividadeFormData>;
}

export function TipoSelect({ form }: TipoSelectProps) {
  return (
    <FormField
      control={form.control}
      name="tipo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Atividade</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(TIPO_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
