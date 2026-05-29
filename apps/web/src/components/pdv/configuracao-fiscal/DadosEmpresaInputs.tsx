// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import type { FiscalFormData } from "./types";

interface DadosEmpresaInputsProps {
  formData: FiscalFormData;
  onChange: <K extends keyof FiscalFormData>(
    field: K,
    value: FiscalFormData[K],
  ) => void;
}

export function DadosEmpresaInputs({
  formData,
  onChange,
}: DadosEmpresaInputsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ *</Label>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={(e) => onChange("cnpj", e.target.value)}
          placeholder="00.000.000/0000-00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="razao_social">Razão Social *</Label>
        <Input
          id="razao_social"
          value={formData.razao_social}
          onChange={(e) => onChange("razao_social", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
        <Input
          id="nome_fantasia"
          value={formData.nome_fantasia}
          onChange={(e) => onChange("nome_fantasia", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
        <Input
          id="inscricao_estadual"
          value={formData.inscricao_estadual}
          onChange={(e) => onChange("inscricao_estadual", e.target.value)}
        />
      </div>
    </>
  );
}
