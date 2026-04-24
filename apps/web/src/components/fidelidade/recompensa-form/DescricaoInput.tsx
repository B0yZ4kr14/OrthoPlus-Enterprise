// cspell:disable
import { Textarea } from "@orthoplus/core-ui/textarea";
import { Label } from "@orthoplus/core-ui/label";

interface DescricaoInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescricaoInput({ value, onChange }: DescricaoInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="descricao">Descrição</Label>
      <Textarea
        id="descricao"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Descrição da recompensa"
        rows={3}
      />
    </div>
  );
}
