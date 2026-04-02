import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { Scan } from "lucide-react";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (barcode: string) => void;
}

export function BarcodeScannerDialog({
  open,
  onOpenChange,
  onScanSuccess,
}: BarcodeScannerDialogProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (open) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "barcode-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // Todos os formatos de código de barras
        },
        false,
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          onOpenChange(false);
        },
        (error) => {
          // Silenciar erros de scan contínuo
        },
      );

      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scanner de Código de Barras
          </DialogTitle>
          <DialogDescription>
            Posicione o código de barras do produto na frente da câmera
          </DialogDescription>
        </DialogHeader>

        <div id="barcode-reader" className="w-full"></div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
