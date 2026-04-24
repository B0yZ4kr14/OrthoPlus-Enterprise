import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@orthoplus/core-ui/dialog";

interface PaymentFormProps {
  valor: string;
  onValorChange: (valor: string) => void;
  children: React.ReactNode;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function PaymentForm({
  valor,
  onValorChange,
  children,
  onCancel,
  onSubmit,
  isLoading,
}: PaymentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="valor">Valor a Pagar</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => onValorChange(e.target.value)}
          required
          placeholder="0.00"
        />
      </div>

      {children}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            "Confirmar Pagamento"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
