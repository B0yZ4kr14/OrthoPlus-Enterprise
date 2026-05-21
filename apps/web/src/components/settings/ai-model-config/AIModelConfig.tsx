// cspell:disable
import { Brain, Key } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Separator } from "@orthoplus/core-ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useAIModelConfig } from "./useAIModelConfig";
import { ProviderSelect } from "./ProviderSelect";
import { APIKeyInput } from "./APIKeyInput";
import { AdvancedSettings } from "./AdvancedSettings";
import { RecommendationAlert } from "./RecommendationAlert";
import { ActionButtons } from "./ActionButtons";
import { API_KEY_FIELDS } from "./types";

export function AIModelConfig() {
  const { selectedClinic } = useAuth();
  const {
    config,
    loading,
    saving,
    showKeys,
    loadConfig,
    saveConfig,
    toggleShowKey,
    updateConfig,
  } = useAIModelConfig({ selectedClinic: selectedClinic?.id || null });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">Carregando...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <CardTitle>Configuração de Modelos de IA</CardTitle>
        </div>
        <CardDescription>
          Selecione o provedor de IA e configure API keys para módulos que usam
          inteligência artificial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProviderSelect
          value={config.default_provider || "local"}
          onChange={(value) => updateConfig({ default_provider: value })}
        />

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <h3 className="text-sm font-medium">Chaves de API (API Keys)</h3>
          </div>

          {API_KEY_FIELDS.map((field) => (
            <APIKeyInput
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              value={(config[field.key] as string) || ""}
              show={!!showKeys[field.key]}
              onChange={(value) => updateConfig({ [field.key]: value })}
              onToggleShow={() => toggleShowKey(field.key)}
              url={field.url}
              urlLabel={field.urlLabel}
            />
          ))}
        </div>

        <Separator />

        <AdvancedSettings
          temperature={config.temperature || 0.7}
          maxTokens={config.max_tokens || 2000}
          onTemperatureChange={(value) => updateConfig({ temperature: value })}
          onMaxTokensChange={(value) => updateConfig({ max_tokens: value })}
        />

        <RecommendationAlert />

        <ActionButtons saving={saving} onSave={saveConfig} onReload={loadConfig} />
      </CardContent>
    </Card>
  );
}
