import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { DollarSign } from "lucide-react";
import type { AberturaCaixaDialogProps } from "./types";
import { useAberturaCaixa } from "./hooks/useAberturaCaixa";
import { ValorInput } from "./components/ValorInput";
import { ObservacoesInput } from "./components/ObservacoesInput";
import { ActionButtons } from "./components/ActionButtons";

export * from "./types";
export { useAberturaCaixa, ValorInput, ObservacoesInput, ActionButtons };

export function AberturaCaixaDialog({
  open,
  onOpenChange,
  onConfirm,
}: AberturaCaixaDialogProps) {
  const {
    valorInicial,
    setValorInicial,
    observacoes,
    setObservacoes,
    loading,
    handleSubmit,
  } = useAberturaCaixa(onConfirm, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Abertura de Caixa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ValorInput value={valorInicial} onChange={setValorInicial} />
          <ObservacoesInput value={observacoes} onChange={setObservacoes} />
          <ActionButtons
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
