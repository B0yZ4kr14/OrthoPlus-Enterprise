/**
 * Database Config Module
 * ======================
 * Módulo de configuração de banco de dados para OrthoPlus
 */

export { DatabaseConfigPage } from './pages/DatabaseConfigPage';
export { useDatabaseConfig } from './hooks/useDatabaseConfig';

// Types
export type {
  EngineType,
  TabType,
  DatabaseConfig,
  EngineInfo,
  MaintenanceTool,
  ConnectionTestResult,
  ConnectionHistoryEntry,
  DocLink,
  MigrationRequest,
  MaintenanceResult,
  ApiResponse,
} from './types';

// Constants
export {
  API_URL,
  TABS,
  DEFAULT_CONFIGS,
  DEFAULT_PORTS,
  VALIDATION_LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FETCH_TIMEOUT,
} from './constants';
