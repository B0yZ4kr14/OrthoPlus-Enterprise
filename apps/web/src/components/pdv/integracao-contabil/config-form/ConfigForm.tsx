import type { ConfigFormData } from "../types";
import { DEFAULT_FORM_DATA } from "../types";
import { SoftwareSelect } from "./SoftwareSelect";
import { ConnectionFields } from "./ConnectionFields";
import { CompanyFields } from "./CompanyFields";
import { SwitchesSection } from "./SwitchesSection";
import { ActionButtons } from "./ActionButtons";

interface ConfigFormProps {
  formData: ConfigFormData;
  setFormData: (data: ConfigFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export function ConfigForm({
  formData,
  setFormData,
  onSubmit,
  saving,
}: ConfigFormProps) {
  const handleReset = () => setFormData(DEFAULT_FORM_DATA);

  const updateField = <K extends keyof ConfigFormData>(
    field: K,
    value: ConfigFormData[K],
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SoftwareSelect
          value={formData.software}
          onChange={(value) => updateField("software", value)}
        />

        <ConnectionFields
          apiUrl={formData.api_url}
          apiKey={formData.api_key}
          apiSecret={formData.api_secret}
          onApiUrlChange={(value) => updateField("api_url", value)}
          onApiKeyChange={(value) => updateField("api_key", value)}
          onApiSecretChange={(value) => updateField("api_secret", value)}
        />

        <CompanyFields
          codigoEmpresa={formData.codigo_empresa}
          emailContador={formData.email_contador}
          periodicidade={formData.periodicidade_envio}
          onCodigoChange={(value) => updateField("codigo_empresa", value)}
          onEmailChange={(value) => updateField("email_contador", value)}
          onPeriodicidadeChange={(value) =>
            updateField("periodicidade_envio", value)
          }
        />
      </div>

      <SwitchesSection
        envioAutomatico={formData.envio_automatico}
        enviarSped={formData.enviar_sped_fiscal}
        enviarNfce={formData.enviar_nfce_dados}
        ativo={formData.ativo}
        onEnvioChange={(checked) => updateField("envio_automatico", checked)}
        onSpedChange={(checked) => updateField("enviar_sped_fiscal", checked)}
        onNfceChange={(checked) => updateField("enviar_nfce_dados", checked)}
        onAtivoChange={(checked) => updateField("ativo", checked)}
      />

      <ActionButtons saving={saving} onReset={handleReset} />
    </form>
  );
}
