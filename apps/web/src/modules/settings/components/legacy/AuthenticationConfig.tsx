import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { KeyRound, Mail, Chrome, RefreshCw } from "lucide-react";
import { Switch } from "@orthoplus/core-ui/switch";
import { Separator } from "@orthoplus/core-ui/separator";

interface AuthConfig {
  email_password_enabled?: boolean;
  google_oauth_enabled?: boolean;
  google_client_id?: string;
  google_client_secret?: string;
  auto_confirm_email?: boolean;
  password_min_length?: number;
  require_uppercase?: boolean;
  require_number?: boolean;
  require_special_char?: boolean;
}

export function AuthenticationConfig() {
  const { toast } = useToast();
  const { selectedClinic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AuthConfig>({
    email_password_enabled: true,
    google_oauth_enabled: false,
    auto_confirm_email: true,
    password_min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_special_char: true,
  });

  /* eslint-disable react-hooks/exhaustive-deps -- data-fetching functions capture deps from closure */
  useEffect(() => {
    loadConfig();
  }, [selectedClinic]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const loadConfig = async () => {
    if (!selectedClinic) return;

    setLoading(true);
    try {
      const dataArray = await apiClient.get<Record<string, any>[]>(
        "/admin/configuracoes/auth",
      );

      const data = dataArray?.[0];

      if (data?.config_data) {
        setConfig(data.config_data as AuthConfig);
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao carregar configurações de autenticação.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedClinic) return;

    setSaving(true);
    try {
      await apiClient.post("/admin/configuracoes/auth", {
        config_data: config as unknown,
      });

      toast({
        title: "Configurações salvas",
        description: "Configurações de autenticação atualizadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
          <KeyRound className="h-5 w-5" />
          <CardTitle>Configurações de Autenticação</CardTitle>
        </div>
        <CardDescription>
          Configure métodos de login e requisitos de senha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email/Senha */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="auth-email-password">Login com Email/Senha</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Permitir login tradicional com email e senha
              </p>
            </div>
            <Switch
              id="auth-email-password"
              checked={config.email_password_enabled || false}
              onCheckedChange={(checked) =>
                setConfig({ ...config, email_password_enabled: checked })
              }
            />
          </div>

          {config.email_password_enabled && (
            <div className="ml-6 space-y-4 border-l-2 border-border pl-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auth-auto-confirm">Auto-confirmar Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Não exigir confirmação de email (recomendado para testes)
                  </p>
                </div>
                <Switch
                  id="auth-auto-confirm"
                  checked={config.auto_confirm_email || false}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, auto_confirm_email: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-length">Tamanho Mínimo da Senha</Label>
                <Input
                  id="min-length"
                  type="number"
                  min={6}
                  max={32}
                  value={config.password_min_length || 8}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      password_min_length: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Requisitos de Senha</Label>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Exigir letra maiúscula</Label>
                  <Switch
                    checked={config.require_uppercase || false}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, require_uppercase: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Exigir número</Label>
                  <Switch
                    checked={config.require_number || false}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, require_number: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">
                    Exigir caractere especial (!@#$%)
                  </Label>
                  <Switch
                    checked={config.require_special_char || false}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, require_special_char: checked })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Google OAuth */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Chrome className="h-4 w-4" />
                <Label htmlFor="auth-google">Login com Google</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Permitir login com conta Google (OAuth 2.0)
              </p>
            </div>
            <Switch
              id="auth-google"
              checked={config.google_oauth_enabled || false}
              onCheckedChange={(checked) =>
                setConfig({ ...config, google_oauth_enabled: checked })
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
                  onChange={(e) =>
                    setConfig({ ...config, google_client_id: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google-client-secret">
                  Google Client Secret
                </Label>
                <Input
                  id="google-client-secret"
                  type="password"
                  placeholder="GOCSPX-*********************"
                  value={config.google_client_secret || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      google_client_secret: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  🔒 Armazenado de forma criptografada
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" onClick={saveConfig} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => loadConfig()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
