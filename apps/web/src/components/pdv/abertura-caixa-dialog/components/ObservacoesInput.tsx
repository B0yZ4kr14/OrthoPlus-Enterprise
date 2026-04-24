import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";

interface ObservacoesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ObservacoesInput({ value, onChange }: ObservacoesInputProps) {
  return (
    <div>
      <Label htmlFor="obs">Observações (opcional)</Label>
      <Textarea
        id="obs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Troco para o dia, notas de R$ 50 e R$ 20"
        rows={3}
      />
    </div>
  );
}
