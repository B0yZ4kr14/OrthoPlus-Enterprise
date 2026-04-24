import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

interface CompanyFieldsProps {
  codigoEmpresa: string;
  emailContador: string;
  periodicidade: string;
  onCodigoChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPeriodicidadeChange: (value: string) => void;
}

export function CompanyFields({
  codigoEmpresa,
  emailContador,
  periodicidade,
  onCodigoChange,
  onEmailChange,
  onPeriodicidadeChange,
}: CompanyFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="codigo_empresa">Código da Empresa</Label>
        <Input
          id="codigo_empresa"
          value={codigoEmpresa}
          onChange={(e) => onCodigoChange(e.target.value)}
          placeholder="Código no sistema contábil"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_contador">E-mail do Contador</Label>
        <Input
          id="email_contador"
          type="email"
          value={emailContador}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="contador@escritorio.com.br"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="periodicidade">Periodicidade de Envio</Label>
        <Select value={periodicidade} onValueChange={onPeriodicidadeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TEMPO_REAL">Tempo Real</SelectItem>
            <SelectItem value="DIARIO">Diário</SelectItem>
            <SelectItem value="SEMANAL">Semanal</SelectItem>
            <SelectItem value="MENSAL">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
