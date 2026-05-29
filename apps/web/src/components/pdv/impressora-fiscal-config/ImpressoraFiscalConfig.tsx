// cspell:disable
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Switch } from "@orthoplus/core-ui/switch";
import { Label } from "@orthoplus/core-ui/label";
import { Loader2 } from "lucide-react";
import { useImpressoraConfig } from "./useImpressoraConfig";
import { ImpressoraCardHeader } from "./CardHeader";
import { TipoEquipamentoSelect } from "./TipoEquipamentoSelect";
import { IdentificacaoInputs } from "./IdentificacaoInputs";
import { EquipamentoInputs } from "./EquipamentoInputs";
import { RedeInputs } from "./RedeInputs";
import { InfoBox } from "./InfoBox";

export function ImpressoraFiscalConfig() {
  const { config, formData, loading, saving, updateFormData, handleSubmit } =
    useImpressoraConfig();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <ImpressoraCardHeader config={config} />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TipoEquipamentoSelect
              value={formData.tipo_equipamento}
              onChange={(v) => updateFormData("tipo_equipamento", v)}
            />
            <IdentificacaoInputs
              formData={formData}
              onChange={updateFormData}
            />
            <EquipamentoInputs formData={formData} onChange={updateFormData} />
            <RedeInputs formData={formData} onChange={updateFormData} />
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => updateFormData("ativo", checked)}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Equipamento ativo para impressão automática
            </Label>
          </div>

          <InfoBox />

          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config ? "Atualizar Configuração" : "Salvar Configuração"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
