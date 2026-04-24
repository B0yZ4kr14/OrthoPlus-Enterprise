export interface BackupStats {
  totalBackups: number;
  storageUsed: string;
  lastBackup: string;
  successRate: string;
}

export interface BackupActivity {
  date: string;
  type: string;
  status: "success" | "failed";
  size: string;
}

export const DEFAULT_STATS: BackupStats = {
  totalBackups: 48,
  storageUsed: "12.3 GB",
  lastBackup: "15/11/2025 18:30",
  successRate: "98.2%",
};

export const DEFAULT_ACTIVITIES: BackupActivity[] = [
  { date: "15/11 18:30", type: "Full", status: "success", size: "2.3 GB" },
  { date: "15/11 12:00", type: "Incremental", status: "success", size: "156 MB" },
  { date: "14/11 18:30", type: "Full", status: "success", size: "2.2 GB" },
  { date: "14/11 12:00", type: "Incremental", status: "failed", size: "-" },
  { date: "13/11 18:30", type: "Full", status: "success", size: "2.1 GB" },
];
