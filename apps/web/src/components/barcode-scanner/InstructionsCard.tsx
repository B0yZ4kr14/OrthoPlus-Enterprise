import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Camera } from "lucide-react";

interface InstructionsCardProps {
  onStart: () => void;
  onCancel?: () => void;
}

export function InstructionsCard({ onStart, onCancel }: InstructionsCardProps) {
  return (
    <Card className="p-8 text-center space-y-4">
      <div className="flex justify-center">
        <div className="p-4 rounded-full bg-primary/10">
          <Camera className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Scanner de Código de Barras/QR Code</h3>
        <p className="text-sm text-muted-foreground">Posicione o código dentro da área de leitura da câmera</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
        <p>📱 Certifique-se de que o código esteja bem iluminado</p>
        <p>📏 Mantenha o dispositivo estável a 15-30cm de distância</p>
        <p>✨ A leitura será automática quando o código for detectado</p>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={onStart} size="lg" className="gap-2">
          <Camera className="h-5 w-5" />
          Iniciar Scanner
        </Button>

        {onCancel && (
          <Button onClick={onCancel} variant="outline" size="lg">
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  );
}
