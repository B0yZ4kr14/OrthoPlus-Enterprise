import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import type { FechamentoCaixaDialogProps } from "./types";
import { useFechamentoCaixa } from "./useFechamentoCaixa";
import { ValorFinalInput } from "./ValorFinalInput";
import { DiferencaAlert } from "./DiferencaAlert";
import { ObservacoesInput } from "./ObservacoesInput";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function FechamentoCaixaDialog({
  open,
  onOpenChange,
  caixaAberto,
  valorEsperado,
  onConfirm,
}: FechamentoCaixaDialogProps) {
  const {
    valorFinal,
    observacoes,
    diferencaInfo,
    isObservacaoRequired,
    isValid,
    setValorFinal,
    setObservacoes,
    handleConfirm,
    handleCancel,
  } = useFechamentoCaixa(valorEsperado, onConfirm, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fechamento de Caixa</DialogTitle>
          <DialogDescription>
            Confirme o valor final do caixa para realizar o fechamento.
          </DialogDescription>
        </DialogHeader>

        {caixaAberto ? (
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">
                Valor Esperado
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(valorEsperado)}
              </div>
            </div>

            <ValorFinalInput value={valorFinal} onChange={setValorFinal} />
            <DiferencaAlert diferencaInfo={diferencaInfo} />
            <ObservacoesInput
              value={observacoes}
              onChange={setObservacoes}
              required={isObservacaoRequired}
            />
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Nenhum caixa aberto para fechamento.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!caixaAberto || !isValid}>
            Confirmar Fechamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
