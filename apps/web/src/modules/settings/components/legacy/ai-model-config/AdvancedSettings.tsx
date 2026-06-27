// cspell:disable
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface AdvancedSettingsProps {
  temperature: number;
  maxTokens: number;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
}

export function AdvancedSettings({
  temperature,
  maxTokens,
  onTemperatureChange,
  onMaxTokensChange,
}: AdvancedSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Configurações Avançadas</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (Criatividade)</Label>
          <Input
            id="temperature"
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={temperature || 0.7}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            0 = Conservador, 1 = Balanceado, 2 = Criativo
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-tokens">Máximo de Tokens</Label>
          <Input
            id="max-tokens"
            type="number"
            min={100}
            max={4000}
            step={100}
            value={maxTokens || 2000}
            onChange={(e) => onMaxTokensChange(parseInt(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Controla tamanho máximo da resposta
          </p>
        </div>
      </div>
    </div>
  );
}
