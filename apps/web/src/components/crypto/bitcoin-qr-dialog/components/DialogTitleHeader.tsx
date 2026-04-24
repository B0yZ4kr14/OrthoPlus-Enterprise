import { DialogHeader, DialogTitle } from "@orthoplus/core-ui/dialog";
import { QrCode } from "lucide-react";

export function DialogTitleHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <QrCode className="h-5 w-5" />
        Gerar QR Code de Pagamento Bitcoin
      </DialogTitle>
    </DialogHeader>
  );
}
