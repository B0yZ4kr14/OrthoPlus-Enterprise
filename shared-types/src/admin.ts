/**
 * Admin Module Types
 * Shared between backend and frontend for admin pages
 */

// ============================================================================
// ADR (Architecture Decision Records)
// ============================================================================

export type AdrStatus = "proposed" | "accepted" | "deprecated" | "superseded";

export interface Adr {
  id: string;
  adrNumber: number;
  title: string;
  status: AdrStatus;
  context: string;
  decision: string;
  consequences: string;
  alternativesConsidered?: string;
  createdAt: string;
  decidedAt?: string;
  createdBy?: string;
  decidedBy?: string;
}

export interface CreateAdrRequest {
  clinicId: string;
  adrNumber: number;
  title: string;
  status: AdrStatus;
  context: string;
  decision: string;
  consequences: string;
  alternativesConsidered?: string;
  createdBy?: string;
  decidedBy?: string;
  decidedAt?: string;
}

// ============================================================================
// Wiki
// ============================================================================

export type WikiCategory =
  | "general"
  | "processes"
  | "apis"
  | "troubleshooting"
  | "guides";

export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: WikiCategory;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  createdBy?: string;
  clinicId?: string;
}

export interface CreateWikiPageRequest {
  clinicId: string;
  title: string;
  slug: string;
  content: string;
  category: WikiCategory;
  isPublished: boolean;
  createdBy?: string;
}

export interface UpdateWikiPageRequest {
  title?: string;
  content?: string;
  category?: WikiCategory;
  isPublished?: boolean;
}

// ============================================================================
// Backups
// ============================================================================

export type BackupType = "full" | "incremental" | "schema_only";
export type BackupStatus = "pending" | "running" | "completed" | "failed";

export interface Backup {
  id: string;
  clinicId?: string;
  backupType: BackupType;
  fileSizeBytes?: number;
  filePath?: string;
  status: BackupStatus;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  isEncrypted?: boolean;
  createdBy?: string;
}

export interface CreateBackupRequest {
  clinicId: string;
  backupType: BackupType;
  createdBy?: string;
}

// ============================================================================
// Database Health / Maintenance
// ============================================================================

export interface DbStats {
  connectionPoolSize: number;
  activeConnections: number;
  slowQueriesCount: number;
  diskUsagePercent: number;
  tableCount: number;
  totalRowsEstimate: number;
  lastVacuumAt?: string;
  lastAnalyzeAt?: string;
}

export type MaintenanceAction = "VACUUM" | "ANALYZE" | "REINDEX";

export interface MaintenanceRequest {
  operation: MaintenanceAction;
  targetSchema?: string;
  targetTable?: string;
}

// ============================================================================
// Audit Logs
// ============================================================================

export interface AuditLog {
  id: number;
  createdAt: string;
  userId: string;
  clinicId: string;
  action: string;
  details: Record<string, unknown>;
  targetModuleId?: number;
  userName?: string;
}

export interface AuditTrailLog {
  id: number;
  timestamp: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: unknown;
  newValues?: unknown;
  sensitivityLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface AuditUser {
  id: string;
  fullName?: string;
}

// ============================================================================
// Backup Status & Execution
// ============================================================================

export interface CategoryBackupStatus {
  category: string;
  lastBackup: string | null;
  lastBackupSize: number | null;
  lastBackupSizeHuman: string;
  backupCount: number;
  schemas: string[];
}

export interface BackupExecutionResult {
  category: string;
  success: boolean;
  filePath: string;
  sizeBytes: number;
  sizeHuman: string;
  durationMs: number;
  schemas: string[];
  error?: string;
}

// ============================================================================
// Slow Queries
// ============================================================================

export interface SlowQuery {
  query: string;
  calls: number;
  averageTime: number;
  totalTime: number;
  lastExecuted: string | Date;
}
