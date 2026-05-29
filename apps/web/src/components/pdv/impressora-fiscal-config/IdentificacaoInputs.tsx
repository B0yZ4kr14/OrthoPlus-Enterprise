// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import type { FormData } from "./types";

interface IdentificacaoInputsProps {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function IdentificacaoInputs({
  formData,
  onChange,
}: IdentificacaoInputsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="numero_serie">Número de Série *</Label>
        <Input
          id="numero_serie"
          value={formData.numero_serie}
          onChange={(e) => onChange("numero_serie", e.target.value)}
          placeholder="Ex: 900000001"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="codigo_ativacao">Código de Ativação *</Label>
        <Input
          id="codigo_ativacao"
          type="password"
          value={formData.codigo_ativacao}
          onChange={(e) => onChange("codigo_ativacao", e.target.value)}
          placeholder="Código fornecido pela SEFAZ"
          required
        />
      </div>
    </>
  );
}
