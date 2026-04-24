// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Switch } from "@orthoplus/core-ui/switch";
import { Label } from "@orthoplus/core-ui/label";
import type { ConfigFormProps } from "./types";
import { BancoSelect } from "./components/BancoSelect";
import { FormInput } from "./components/FormInput";
import { ActionButtons } from "./components/ActionButtons";

export * from "./types";
export { BancoSelect, FormInput, ActionButtons };

export function ConfigForm({
  editando,
  bancos,
  loading,
  onSave,
  onCancel,
  onChange,
}: ConfigFormProps) {
  const handleBancoChange = (codigo: string, nome: string) => {
    onChange("banco_codigo", codigo);
    onChange("banco_nome", nome);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {editando.id ? "Editar" : "Nova"} Configuração
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <BancoSelect
          bancos={bancos}
          value={editando.banco_codigo}
          onChange={handleBancoChange}
        />

        <FormInput
          label="Agência"
          value={editando.agencia}
          onChange={(value) => onChange("agencia", value)}
          placeholder="0001"
        />

        <FormInput
          label="Conta"
          value={editando.conta}
          onChange={(value) => onChange("conta", value)}
          placeholder="12345-6"
        />

        <FormInput
          label="URL da API"
          value={editando.api_url}
          onChange={(value) => onChange("api_url", value)}
          placeholder="https://api.banco.com.br/extrato"
        />

        <FormInput
          label="API Key"
          value={editando.api_key}
          onChange={(value) => onChange("api_key", value)}
          type="password"
        />

        <FormInput
          label="API Secret"
          value={editando.api_secret}
          onChange={(value) => onChange("api_secret", value)}
          type="password"
        />

        <div className="col-span-2">
          <FormInput
            label="Caminho do Certificado"
            value={editando.certificado_path}
            onChange={(value) => onChange("certificado_path", value)}
            placeholder="/certs/banco_certificado.pfx"
          />
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Switch
            checked={editando.ativo}
            onCheckedChange={(checked) => onChange("ativo", checked)}
          />
          <Label>Ativo</Label>
        </div>
      </div>

      <ActionButtons loading={loading} onSave={onSave} onCancel={onCancel} />
    </Card>
  );
}
