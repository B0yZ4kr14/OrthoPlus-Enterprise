export interface GitHubConfig {
  repository_url?: string;
  auto_sync_enabled?: boolean;
  branch_name?: string;
  last_sync_at?: string;
}

export interface GitHubIntegrationConfigProps {
  // Componente não recebe props externas, usa contexto
}
