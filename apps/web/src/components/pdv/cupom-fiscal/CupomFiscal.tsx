// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { useCupomFiscal } from "./useCupomFiscal";
import { CupomHeader } from "./CupomHeader";
import { CupomContent } from "./CupomContent";
import { CupomActions } from "./CupomActions";
import type { CupomFiscalProps } from "./types";

export function CupomFiscal({ venda, items }: CupomFiscalProps) {
  const { cupomRef, emitirNFCeMutation, handlePrint, valorTotal } =
    useCupomFiscal({
      venda,
      items,
    });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <CupomHeader venda={venda} />

        <div
          ref={cupomRef}
          className="cupom border border-border rounded-lg p-6 bg-background text-foreground font-mono text-sm"
        >
          <CupomContent items={items} valorTotal={valorTotal} />
        </div>

        <CupomActions
          onPrint={handlePrint}
          onEmitirNFCe={() => emitirNFCeMutation.mutate()}
          isPending={emitirNFCeMutation.isPending}
        />
      </Card>
    </div>
  );
}
