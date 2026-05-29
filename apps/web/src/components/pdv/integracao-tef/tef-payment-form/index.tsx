import { Card } from "@orthoplus/core-ui/card";
import { CreditCard } from "lucide-react";
import type { TEFPaymentFormProps } from "./types";
import { OperationSelect } from "./components/OperationSelect";
import { ParcelasSelect } from "./components/ParcelasSelect";
import { ValorDisplay } from "./components/ValorDisplay";
import { ProcessButton } from "./components/ProcessButton";

export * from "./types";
export { OperationSelect, ParcelasSelect, ValorDisplay, ProcessButton };
export { useParcelas } from "./hooks/useParcelas";

export function TEFPaymentForm({
  valorTotal,
  tipoOperacao,
  onTipoChange,
  numParcelas,
  onParcelasChange,
  processando,
  onProcessar,
}: TEFPaymentFormProps) {
  return (
    <Card depth="normal" className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Pagamento com Cartão (TEF)</h3>
      </div>

      <div className="space-y-4">
        <OperationSelect value={tipoOperacao} onChange={onTipoChange} />

        {tipoOperacao === "CREDITO" && (
          <ParcelasSelect
            valorTotal={valorTotal}
            value={numParcelas}
            onChange={onParcelasChange}
          />
        )}

        <ValorDisplay valorTotal={valorTotal} />

        <ProcessButton processando={processando} onClick={onProcessar} />

        <p className="text-xs text-muted-foreground text-center">
          Aguarde a confirmação no terminal PinPad
        </p>
      </div>
    </Card>
  );
}
