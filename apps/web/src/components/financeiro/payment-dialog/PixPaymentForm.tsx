import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";

interface PixPaymentFormProps {
  pixKey: string;
  onChange: (value: string) => void;
}

export function PixPaymentForm({ pixKey, onChange }: PixPaymentFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="pix-key">Chave PIX</Label>
      <Input
        id="pix-key"
        value={pixKey}
        onChange={(e) => onChange(e.target.value)}
        placeholder="CPF, email, telefone ou chave aleatória"
      />
    </div>
  );
}
