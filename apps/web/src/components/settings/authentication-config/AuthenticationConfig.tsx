// cspell:disable
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Separator } from "@orthoplus/core-ui/separator";
import { useAuthConfig } from "./useAuthConfig";
import { LoadingState } from "./LoadingState";
import { AuthCardHeader } from "./CardHeader";
import { EmailPasswordSection } from "./EmailPasswordSection";
import { GoogleOAuthSection } from "./GoogleOAuthSection";
import { ActionButtons } from "./ActionButtons";

export function AuthenticationConfig() {
  const { config, loading, saving, loadConfig, saveConfig, updateConfig } =
    useAuthConfig();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Card>
      <AuthCardHeader />
      <CardContent className="space-y-6">
        <EmailPasswordSection config={config} onUpdate={updateConfig} />
        <Separator />
        <GoogleOAuthSection config={config} onUpdate={updateConfig} />
        <ActionButtons
          saving={saving}
          onSave={saveConfig}
          onReload={loadConfig}
        />
      </CardContent>
    </Card>
  );
}
