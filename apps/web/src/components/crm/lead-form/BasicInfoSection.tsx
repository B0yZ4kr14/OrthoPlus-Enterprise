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
import type { LeadFormData } from "./types";
import { ORIGEM_OPTIONS } from "./types";

interface BasicInfoSectionProps {
  form: UseFormReturn<LeadFormData>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const { register, formState: { errors }, setValue, watch } = form;

  return (
    <>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="nome">Nome Completo *</Label>
        <Input id="nome" {...register("nome")} placeholder="Ex: João Silva" />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} placeholder="joao@email.com" />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input id="telefone" {...register("telefone")} placeholder="(11) 99999-9999" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input id="whatsapp" {...register("whatsapp")} placeholder="(11) 99999-9999" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="origem">Origem *</Label>
        <Select onValueChange={(v) => setValue("origem", v)} defaultValue={watch("origem")}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {ORIGEM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.origem && (
          <p className="text-sm text-destructive">{errors.origem.message}</p>
        )}
      </div>
    </>
  );
}
