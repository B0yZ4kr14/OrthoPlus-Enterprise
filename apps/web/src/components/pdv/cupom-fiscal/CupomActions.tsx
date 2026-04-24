// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { Printer, FileText } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

interface CupomActionsProps {
  onPrint: () => void;
  onEmitirNFCe: () => void;
  isPending: boolean;
}

export function CupomActions({ onPrint, onEmitirNFCe, isPending }: CupomActionsProps) {
  return (
    <div className="flex gap-3 mt-6">
      <Button variant="outline" onClick={onPrint} className="flex-1">
        <Printer className="h-4 w-4 mr-2" />
        Imprimir Cupom
      </Button>
      <Button onClick={onEmitirNFCe} disabled={isPending} className="flex-1">
        <FileText className="h-4 w-4 mr-2" />
        {isPending ? "Emitindo..." : "Emitir NFCe"}
      </Button>
    </div>
  );
}
