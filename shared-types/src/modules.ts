/**
 * Module / Catalog Types
 * Shared between backend and frontend
 */

// ============================================================================
// Module Catalog
// ============================================================================

export type ModuleCategory =
  | "core"
  | "clinical"
  | "financial"
  | "marketing"
  | "administrative"
  | "integration";

export type ModuleStatus = "active" | "inactive" | "deprecated" | "beta";

export interface ModuleCatalog {
  id: number;
  moduleKey: string;
  name: string;
  description?: string;
  category: ModuleCategory;
  status: ModuleStatus;
  version?: string;
  icon?: string;
  color?: string;
  requiresSubscription?: boolean;
  dependencies?: string[];
}

// ============================================================================
// Clinic Module (activation)
// ============================================================================

export interface ClinicModule {
  id: number;
  clinicId: string;
  moduleCatalogId: number;
  isActive: boolean;
  activatedAt?: string;
  deactivatedAt?: string;
  settings?: Record<string, unknown>;
  module?: ModuleCatalog;
}

export interface ToggleModuleRequest {
  clinicId: string;
  moduleKey: string;
  isActive: boolean;
}
