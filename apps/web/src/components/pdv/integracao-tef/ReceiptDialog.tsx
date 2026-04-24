import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { CheckCircle, Printer } from "lucide-react";
import type { TEFTransaction } from "./types";

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  transacao: TEFTransaction["transacao"] | null;
  onPrint: () => void;
}

export function ReceiptDialog({ open, onClose, transacao, onPrint }: ReceiptDialogProps) {
  if (!transacao) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Pagamento Aprovado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">NSU</p>
                <p className="font-medium">{transacao.nsu_sitef}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Autorização</p>
                <p className="font-medium">{transacao.codigo_autorizacao}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium">{transacao.tipo_operacao}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor</p>
                <p className="font-medium">R$ {parseFloat(transacao.valor).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <pre className="bg-background p-4 rounded border text-xs font-mono whitespace-pre-wrap">
            {transacao.comprovante_cliente}
          </pre>

          <div className="flex gap-2">
            <Button onClick={onPrint} className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Comprovante
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
