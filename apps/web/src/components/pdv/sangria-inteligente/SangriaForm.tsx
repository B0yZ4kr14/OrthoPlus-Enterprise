// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";

interface SangriaFormProps {
  valorSangria: number;
  observacoes: string;
  valorAtualCaixa: number;
  isPending: boolean;
  onValorChange: (valor: number) => void;
  onObservacoesChange: (obs: string) => void;
  onSubmit: () => void;
}

export function SangriaForm({
  valorSangria,
  observacoes,
  valorAtualCaixa,
  isPending,
  onValorChange,
  onObservacoesChange,
  onSubmit,
}: SangriaFormProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Realizar Sangria</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="valor">Valor da Sangria *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={valorSangria}
            onChange={(e) => onValorChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
          <p className="text-sm text-muted-foreground">
            Disponível em caixa:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valorAtualCaixa)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => onObservacoesChange(e.target.value)}
            placeholder="Motivo da sangria..."
            rows={3}
          />
        </div>

        <Button
          onClick={onSubmit}
          disabled={isPending || valorSangria <= 0}
          className="w-full"
        >
          {isPending ? "Processando..." : "Confirmar Sangria"}
        </Button>
      </div>
    </Card>
  );
}
