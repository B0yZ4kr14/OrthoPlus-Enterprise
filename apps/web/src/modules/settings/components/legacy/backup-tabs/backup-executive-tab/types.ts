export interface TrendDataPoint {
  date: string;
  success: number;
  failed: number;
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  successRate: number;
  avgSize: number;
  totalSize: number;
  trendData: TrendDataPoint[];
}
