// cspell:disable
import { Label } from "@orthoplus/core-ui/label";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { AI_PROVIDERS } from "./types";

interface ProviderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProviderSelect({ value, onChange }: ProviderSelectProps) {
  const selectedProvider = AI_PROVIDERS.find((p) => p.id === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="provider">Provedor de IA Padrão</Label>
      <Select value={value || "lovable"} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AI_PROVIDERS.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex items-center gap-2">
                {provider.name}
                {provider.free && (
                  <Badge variant="outline" className="text-xs">
                    Gratuito
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedProvider && (
        <p className="text-sm text-muted-foreground">
          Modelos disponíveis: {selectedProvider.models.join(", ")}
        </p>
      )}
    </div>
  );
}
