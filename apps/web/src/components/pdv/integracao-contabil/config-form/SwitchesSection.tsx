import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";

interface SwitchesSectionProps {
  envioAutomatico: boolean;
  enviarSped: boolean;
  enviarNfce: boolean;
  ativo: boolean;
  onEnvioChange: (checked: boolean) => void;
  onSpedChange: (checked: boolean) => void;
  onNfceChange: (checked: boolean) => void;
  onAtivoChange: (checked: boolean) => void;
}

export function SwitchesSection({
  envioAutomatico,
  enviarSped,
  enviarNfce,
  ativo,
  onEnvioChange,
  onSpedChange,
  onNfceChange,
  onAtivoChange,
}: SwitchesSectionProps) {
  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="flex items-center space-x-2">
        <Switch
          id="envio_automatico"
          checked={envioAutomatico}
          onCheckedChange={onEnvioChange}
        />
        <Label htmlFor="envio_automatico" className="cursor-pointer">
          Envio automático conforme periodicidade
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enviar_sped"
          checked={enviarSped}
          onCheckedChange={onSpedChange}
        />
        <Label htmlFor="enviar_sped" className="cursor-pointer">
          Enviar SPED Fiscal
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enviar_nfce"
          checked={enviarNfce}
          onCheckedChange={onNfceChange}
        />
        <Label htmlFor="enviar_nfce" className="cursor-pointer">
          Enviar dados de NFCe
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="ativo" checked={ativo} onCheckedChange={onAtivoChange} />
        <Label htmlFor="ativo" className="cursor-pointer">
          Integração ativa
        </Label>
      </div>
    </div>
  );
}
