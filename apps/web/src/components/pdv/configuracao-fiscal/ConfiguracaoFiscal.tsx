// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { useFiscalConfig } from "./useFiscalConfig";
import { ConfigHeader } from "./ConfigHeader";
import { AmbienteSelect } from "./AmbienteSelect";
import { TipoEmissaoSelect } from "./TipoEmissaoSelect";
import { DadosEmpresaInputs } from "./DadosEmpresaInputs";
import { RegimeTributarioSelect } from "./RegimeTributarioSelect";
import { CSCInputs } from "./CSCInputs";
import { ContatoESeguranca } from "./ContatoESeguranca";
import { LoadingState } from "@/components/shared/LoadingState";

export function ConfiguracaoFiscal() {
  const { fiscalConfig, formData, isLoading, isSaving, updateFormData, handleSubmit } =
    useFiscalConfig();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <ConfigHeader config={fiscalConfig} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AmbienteSelect value={formData.ambiente} onChange={(v) => updateFormData("ambiente", v)} />
          <TipoEmissaoSelect
            value={formData.tipo_emissao}
            onChange={(v) => updateFormData("tipo_emissao", v)}
          />
          <DadosEmpresaInputs formData={formData} onChange={updateFormData} />
          <RegimeTributarioSelect formData={formData} onChange={updateFormData} />
          <CSCInputs formData={formData} onChange={updateFormData} />
          <ContatoESeguranca formData={formData} onChange={updateFormData} />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
