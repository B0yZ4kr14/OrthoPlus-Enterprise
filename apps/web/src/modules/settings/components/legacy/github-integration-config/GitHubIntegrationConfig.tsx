import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Github } from "lucide-react";
import { useGitHubConfig } from "./useGitHubConfig";
import { RepositoryInput } from "./RepositoryInput";
import { BranchInput } from "./BranchInput";
import { AutoSyncToggle } from "./AutoSyncToggle";
import { LastSyncInfo } from "./LastSyncInfo";
import { ActionButtons } from "./ActionButtons";

export function GitHubIntegrationConfig() {
  const {
    config,
    loading,
    saving,
    updateConfig,
    saveConfig,
    testConnection,
    reload,
  } = useGitHubConfig();

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
          <Github className="h-5 w-5" />
          <CardTitle>Integração com GitHub</CardTitle>
        </div>
        <CardDescription>
          Configure o repositório GitHub para versionamento e backup do código
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <RepositoryInput
            value={config.repository_url || ""}
            onChange={(value) => updateConfig("repository_url", value)}
            onTest={testConnection}
          />

          <BranchInput
            value={config.branch_name || "main"}
            onChange={(value) => updateConfig("branch_name", value)}
          />

          <AutoSyncToggle
            checked={config.auto_sync_enabled || false}
            onChange={(checked) => updateConfig("auto_sync_enabled", checked)}
          />

          <LastSyncInfo lastSyncAt={config.last_sync_at} />
        </div>

        <ActionButtons saving={saving} onSave={saveConfig} onReload={reload} />
      </CardContent>
    </Card>
  );
}
