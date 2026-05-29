import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";

interface ObservacoesInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function ObservacoesInput({
  value,
  onChange,
  required,
}: ObservacoesInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="observacoes">
        Observações
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Textarea
        id="observacoes"
        placeholder="Observações sobre o fechamento do caixa..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
