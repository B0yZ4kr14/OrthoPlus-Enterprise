import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { PaymentMethod } from "./types";

interface CardFields {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

interface CardPaymentFormProps {
  fields: CardFields;
  onFieldChange: (field: keyof CardFields, value: string) => void;
  metodo: PaymentMethod;
  onTypeChange: (type: PaymentMethod) => void;
}

export function CardPaymentForm({
  fields,
  onFieldChange,
  metodo,
  onTypeChange,
}: CardPaymentFormProps) {
  const isRequired = metodo !== "PIX" && metodo !== "CRYPTO";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-number">Número do Cartão</Label>
        <Input
          id="card-number"
          value={fields.number}
          onChange={(e) => onFieldChange("number", e.target.value)}
          placeholder="0000 0000 0000 0000"
          required={isRequired}
          maxLength={19}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-holder">Nome no Cartão</Label>
        <Input
          id="card-holder"
          value={fields.holder}
          onChange={(e) => onFieldChange("holder", e.target.value)}
          placeholder="NOME COMPLETO"
          required={isRequired}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="card-expiry">Validade</Label>
          <Input
            id="card-expiry"
            value={fields.expiry}
            onChange={(e) => onFieldChange("expiry", e.target.value)}
            placeholder="MM/AA"
            required={isRequired}
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="card-cvv">CVV</Label>
          <Input
            id="card-cvv"
            value={fields.cvv}
            onChange={(e) => onFieldChange("cvv", e.target.value)}
            placeholder="000"
            required={isRequired}
            maxLength={4}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-type">Tipo de Cartão</Label>
        <Select value={metodo} onValueChange={(v) => onTypeChange(v as PaymentMethod)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CARTAO_CREDITO">Crédito</SelectItem>
            <SelectItem value="CARTAO_DEBITO">Débito</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
