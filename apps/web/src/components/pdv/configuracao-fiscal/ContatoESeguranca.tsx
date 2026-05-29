// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";
import { Shield } from "lucide-react";
import type { FiscalFormData } from "./types";

interface ContatoESegurancaProps {
  formData: FiscalFormData;
  onChange: <K extends keyof FiscalFormData>(
    field: K,
    value: FiscalFormData[K],
  ) => void;
}

export function ContatoESeguranca({
  formData,
  onChange,
}: ContatoESegurancaProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email_contabilidade">Email Contabilidade</Label>
        <Input
          id="email_contabilidade"
          type="email"
          value={formData.email_contabilidade}
          onChange={(e) => onChange("email_contabilidade", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="contingencia"
          checked={formData.contingencia_enabled}
          onCheckedChange={(checked) =>
            onChange("contingencia_enabled", checked)
          }
        />
        <Label htmlFor="contingencia">Modo Contingência</Label>
      </div>

      <div className="flex items-center gap-3 mt-6 p-4 rounded-lg bg-info/10 border border-info/20">
        <Shield className="h-5 w-5 text-info" />
        <div className="text-sm text-info-foreground">
          <p className="font-medium">Certificado Digital (A1 ou A3)</p>
          <p className="text-xs mt-1">
            O upload do certificado digital será implementado posteriormente.
            Configure as demais informações por enquanto.
          </p>
        </div>
      </div>
    </>
  );
}
