// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Label } from "@orthoplus/core-ui/label";
import { Loader2 } from "lucide-react";
import type { Procedimento } from "./types";

interface ProcedimentoSelectProps {
  procedimentos: Procedimento[];
  value: string | null;
  onChange: (value: string | null) => void;
  loading?: boolean;
}

export function ProcedimentoSelect({
  procedimentos,
  value,
  onChange,
  loading,
}: ProcedimentoSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="procedimento">Procedimento</Label>
      <Select
        value={value || ""}
        onValueChange={(v) => onChange(v || null)}
        disabled={loading}
      >
        <SelectTrigger id="procedimento">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SelectValue placeholder="Selecione o procedimento" />
          )}
        </SelectTrigger>
        <SelectContent>
          {procedimentos.map((proc) => (
            <SelectItem key={proc.id} value={proc.id}>
              {proc.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
