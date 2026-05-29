import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { CriterioTipo } from "./types";
import { NIVEL_OPTIONS } from "./types";

interface CriterioFieldsProps {
  criterioTipo: CriterioTipo;
  criterioValor: number | string;
  onTipoChange: (tipo: CriterioTipo) => void;
  onValorChange: (valor: number | string) => void;
}

export function CriterioFields({
  criterioTipo,
  criterioValor,
  onTipoChange,
  onValorChange,
}: CriterioFieldsProps) {
  const label =
    criterioTipo === "pontos_totais"
      ? "Pontos Necessários *"
      : "Nível Necessário *";

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="criterio_tipo">Tipo de Critério *</Label>
        <Select
          value={criterioTipo}
          onValueChange={(value: CriterioTipo) => onTipoChange(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pontos_totais">Pontos Totais</SelectItem>
            <SelectItem value="nivel">Nível de Fidelidade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="criterio_valor">{label}</Label>
        {criterioTipo === "pontos_totais" ? (
          <Input
            id="criterio_valor"
            type="number"
            min="1"
            value={criterioValor as number}
            onChange={(e) => onValorChange(Number(e.target.value))}
            required
          />
        ) : (
          <Select
            value={criterioValor as string}
            onValueChange={(value) => onValorChange(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NIVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
