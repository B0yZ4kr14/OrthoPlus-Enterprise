// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";

interface NomeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NomeInput({ value, onChange }: NomeInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="nome">Nome *</Label>
      <Input
        id="nome"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nome da recompensa"
        required
      />
    </div>
  );
}
