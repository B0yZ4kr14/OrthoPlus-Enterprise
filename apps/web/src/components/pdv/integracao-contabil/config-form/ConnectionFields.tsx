import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface ConnectionFieldsProps {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
  onApiUrlChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onApiSecretChange: (value: string) => void;
}

export function ConnectionFields({
  apiUrl,
  apiKey,
  apiSecret,
  onApiUrlChange,
  onApiKeyChange,
  onApiSecretChange,
}: ConnectionFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="api_url">URL da API *</Label>
        <Input
          id="api_url"
          value={apiUrl}
          onChange={(e) => onApiUrlChange(e.target.value)}
          placeholder="https://api.softwarecontabil.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="api_key">API Key</Label>
        <Input
          id="api_key"
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Chave de API fornecida pelo software"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="api_secret">API Secret</Label>
        <Input
          id="api_secret"
          type="password"
          value={apiSecret}
          onChange={(e) => onApiSecretChange(e.target.value)}
          placeholder="Secret fornecido pelo software"
        />
      </div>
    </>
  );
}
