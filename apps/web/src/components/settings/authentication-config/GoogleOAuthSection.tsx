// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";
import { Chrome } from "lucide-react";
import type { AuthConfig } from "./types";

interface GoogleOAuthSectionProps {
  config: AuthConfig;
  onUpdate: (updates: Partial<AuthConfig>) => void;
}

export function GoogleOAuthSection({
  config,
  onUpdate,
}: GoogleOAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Chrome className="h-4 w-4" />
            <Label>Login com Google</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Permitir login com conta Google (OAuth 2.0)
          </p>
        </div>
        <Switch
          checked={config.google_oauth_enabled || false}
          onCheckedChange={(checked) =>
            onUpdate({ google_oauth_enabled: checked })
          }
        />
      </div>

      {config.google_oauth_enabled && (
        <div className="ml-6 space-y-4 border-l-2 border-border pl-4">
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
            <p className="text-sm text-info dark:text-info">
              <strong>⚠️ Configuração no Google Cloud Console:</strong>
            </p>
            <ol className="text-sm text-info dark:text-info mt-2 space-y-1 list-decimal list-inside">
              <li>
                Acesse{" "}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener"
                  className="underline"
                >
                  Google Cloud Console
                </a>
              </li>
              <li>Crie um projeto OAuth 2.0</li>
              <li>Adicione URLs autorizadas (redirect URIs)</li>
              <li>Obtenha Client ID e Client Secret</li>
              <li>Configure abaixo</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-client-id">Google Client ID</Label>
            <Input
              id="google-client-id"
              placeholder="123456789-abc123.apps.googleusercontent.com"
              value={config.google_client_id || ""}
              onChange={(e) => onUpdate({ google_client_id: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-client-secret">Google Client Secret</Label>
            <Input
              id="google-client-secret"
              type="password"
              placeholder="GOCSPX-*********************"
              value={config.google_client_secret || ""}
              onChange={(e) =>
                onUpdate({ google_client_secret: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              🔒 Armazenado de forma criptografada
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
