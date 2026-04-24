import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { Banco } from "../../types";

interface BancoSelectProps {
  bancos: Banco[];
  value: string;
  onChange: (value: string, nome: string) => void;
}

export function BancoSelect({ bancos, value, onChange }: BancoSelectProps) {
  const handleChange = (codigo: string) => {
    const banco = bancos.find((b) => b.codigo === codigo);
    onChange(codigo, banco?.nome || "");
  };

  return (
    <div>
      <Label>Banco</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o banco" />
        </SelectTrigger>
        <SelectContent>
          {bancos.map((banco) => (
            <SelectItem key={banco.codigo} value={banco.codigo}>
              {banco.codigo} - {banco.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
