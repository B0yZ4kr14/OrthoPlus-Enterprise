export interface RetentionConfig {
  backup_retention_days: number;
  auto_cleanup_enabled: boolean;
}

export interface CleanupResult {
  deleted_count: number;
  freed_bytes: number;
}
