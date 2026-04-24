import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@orthoplus/core-ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { VitalSignsSectionProps } from "./types";
import { BLOOD_TYPES } from "./types";

export function BloodTypeSelect({ form }: VitalSignsSectionProps) {
  return (
    <FormField
      control={form.control}
      name="blood_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo Sanguíneo</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {BLOOD_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
