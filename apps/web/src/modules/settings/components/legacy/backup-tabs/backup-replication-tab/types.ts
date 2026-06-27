export interface ReplicationRecord {
  id: string;
  region: string;
  replication_status: string;
  created_at: string;
}

export interface ReplicationStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
}

export interface StatusConfig {
  variant: "default" | "success" | "warning" | "destructive";
  icon: "check" | "x" | "clock" | "globe";
  label: string;
}
