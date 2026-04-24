import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { UseFormReturn } from "react-hook-form";
import type { LeadFormData, StatusFunil, Temperatura } from "./types";
import { STATUS_FUNIL_OPTIONS, TEMPERATURA_OPTIONS } from "./types";

interface FunnelSectionProps {
  form: UseFormReturn<LeadFormData>;
}

export function FunnelSection({ form }: FunnelSectionProps) {
  const { register, setValue, watch } = form;

  return (
    <>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="interesse">Interesse/Tratamento</Label>
        <Input id="interesse" {...register("interesse")} placeholder="Ex: Aparelho Ortodôntico, Clareamento..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status_funil">Status no Funil *</Label>
        <Select
          onValueChange={(v) => setValue("status_funil", v as StatusFunil)}
          defaultValue={watch("status_funil")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FUNIL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperatura">Temperatura *</Label>
        <Select
          onValueChange={(v) => setValue("temperatura", v as Temperatura)}
          defaultValue={watch("temperatura")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {TEMPERATURA_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
        <Input
          id="valor_estimado"
          type="number"
          step="0.01"
          {...register("valor_estimado", { valueAsNumber: true })}
          placeholder="0.00"
        />
      </div>
    </>
  );
}
