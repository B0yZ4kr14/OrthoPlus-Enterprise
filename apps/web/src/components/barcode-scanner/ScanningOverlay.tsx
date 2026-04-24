import { Button } from "@orthoplus/core-ui/button";
import { Loader2, X } from "lucide-react";

interface ScanningOverlayProps {
  onCancel: () => void;
}

export function ScanningOverlay({ onCancel }: ScanningOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-full max-w-md aspect-square">
          <div className="absolute inset-0 border-4 border-primary rounded-lg shadow-2xl">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
            <div
              className="absolute inset-x-0 top-0 h-1 bg-primary animate-pulse"
              style={{ animation: "scan 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-lg font-medium">Escaneando código...</p>
        </div>

        <p className="text-sm text-white/70">Posicione o código dentro da área destacada</p>

        <Button onClick={onCancel} variant="destructive" size="lg" className="w-full gap-2">
          <X className="h-5 w-5" />
          Cancelar Scanner
        </Button>
      </div>
    </div>
  );
}
