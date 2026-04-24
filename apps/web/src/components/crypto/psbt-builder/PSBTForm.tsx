import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Button } from "@orthoplus/core-ui/button";
import { QrCode } from "lucide-react";

interface PSBTFormProps {
  recipient: string;
  amount: string;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onGenerate: () => void;
}

export function PSBTForm({
  recipient,
  amount,
  onRecipientChange,
  onAmountChange,
  onGenerate,
}: PSBTFormProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="recipient">Endereço Destinatário</Label>
        <Input
          id="recipient"
          placeholder="bc1q..."
          value={recipient}
          onChange={(e) => onRecipientChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor (BTC)</Label>
        <Input
          id="amount"
          type="number"
          step="0.00000001"
          placeholder="0.001"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </div>

      <Button onClick={onGenerate} className="w-full">
        <QrCode className="mr-2 h-4 w-4" />
        Gerar PSBT
      </Button>
    </>
  );
}
