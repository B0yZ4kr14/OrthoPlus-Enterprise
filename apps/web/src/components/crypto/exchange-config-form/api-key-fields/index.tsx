// cspell:disable
import type { ApiKeyFieldsProps } from "./types";
import { ApiKeyField } from "./components/ApiKeyField";

export * from "./types";
export { ApiKeyField };

const API_KEY_TOOLTIP = `Chave pública da API da exchange. Você pode gerar esta
chave na seção de API Settings da sua conta na exchange.
<strong>Não compartilhe esta chave publicamente.</strong>`;

const API_SECRET_TOOLTIP = `Chave secreta da API da exchange. Esta é uma credencial
sensível que permite operações na sua conta.
<strong>NUNCA compartilhe este valor com ninguém.</strong>
Guarde em local seguro.`;

export function ApiKeyFields({ form }: ApiKeyFieldsProps) {
  return (
    <>
      <ApiKeyField
        form={form}
        name="api_key"
        label="API Key"
        placeholder="Ex: nKd8sH3jDk2Hs9fKd8sH3jDk2Hs9f"
        description="Chave de API da exchange (mínimo 16 caracteres)"
        tooltipContent={API_KEY_TOOLTIP}
      />

      <ApiKeyField
        form={form}
        name="api_secret"
        label="API Secret"
        placeholder="Ex: 8fKd8sH3jDk2Hs9f8fKd8sH3jDk2Hs9f8fKd8sH3jDk2Hs9f"
        description="Chave secreta da API (mínimo 16 caracteres)"
        tooltipContent={API_SECRET_TOOLTIP}
      />
    </>
  );
}
