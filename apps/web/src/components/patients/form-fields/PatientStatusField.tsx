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
import { Badge } from "@orthoplus/core-ui/badge";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PatientStatus,
} from "@/types/patient-status";

interface PatientStatusFieldProps {
  form: unknown;
}

export function PatientStatusField({ form }: PatientStatusFieldProps) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status do Paciente *</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value || "PROSPECT"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[400px] overflow-y-auto">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[key as PatientStatus]}
                    >
                      {label}
                    </Badge>
                  </div>
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
