/**
 * Database Config Constants
 * =========================
 * Constantes para o módulo de configuração de banco de dados
 * 
 * NOTA DE ARQUITETURA v2.0:
 * O OrthoPlus Enterprise suporta APENAS PostgreSQL em produção.
 * Outros engines (SQLite, MariaDB, Firebird) estão disponíveis
 * exclusivamente para desenvolvimento local e migração de dados.
 * 
 * Configuração recomendada para Ubuntu Server LTS:
 * - PostgreSQL 16
 * - max_connections: 200
 * - shared_buffers: 256MB
 * - SSL obrigatório em produção
 */

import type { EngineType, TabType } from '../types';
import {
  Database,
  Settings,
  Wrench,
  ArrowRightLeft,
  FileText,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// URL da API - usar variável de ambiente ou fallback para desenvolvimento
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

// Configurações de timeout
export const FETCH_TIMEOUT = 10000;
export const MESSAGE_TIMEOUT = 3000;

// Tabs disponíveis
export interface TabConfig {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

export const TABS: TabConfig[] = [
  { id: 'motor', label: 'Motor', icon: Database },
  { id: 'config', label: 'Config', icon: Settings },
  { id: 'reparo', label: 'Reparo', icon: Wrench },
  { id: 'migracao', label: 'Migração', icon: ArrowRightLeft },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'docs', label: 'Docs', icon: BookOpen },
];

// Configurações padrão por motor
// PRODUÇÃO: Apenas PostgreSQL é suportado
export const DEFAULT_CONFIGS: Record<EngineType, {
  host: string;
  port: number;
  database: string;
  username: string;
  ssl_mode?: string;
  charset?: string;
  file_path?: string;
}> = {
  // POSTGRESQL - Único engine suportado em produção
  postgresql: {
    host: 'localhost',
    port: 5432,
    database: 'orthoplus',
    username: 'orthoplus',
    ssl_mode: 'prefer',
    charset: 'utf8',
  },
  // SQLITE - Apenas para desenvolvimento local
  sqlite: {
    host: 'localhost',
    port: 0,
    database: 'database',
    username: '',
    file_path: '/var/lib/orthoplus/database.db',
  },
  // MARIADB - Apenas para migração de sistemas legados
  mariadb: {
    host: 'localhost',
    port: 3306,
    database: 'orthoplus',
    username: 'root',
    charset: 'utf8mb4',
  },
  // FIREBIRD - Apenas para migração de sistemas legados
  firebird: {
    host: 'localhost',
    port: 3050,
    database: 'orthoplus.fdb',
    username: 'SYSDBA',
  },
};

// Portas padrão por motor
export const DEFAULT_PORTS: Record<EngineType, number | null> = {
  sqlite: null,
  postgresql: 5432,
  mariadb: 3306,
  firebird: 3050,
};

// Limites de validação
export const VALIDATION_LIMITS = {
  PORT_MIN: 1,
  PORT_MAX: 65535,
  HOST_MAX_LENGTH: 253,
  DATABASE_MAX_LENGTH: 64,
  USERNAME_MAX_LENGTH: 32,
  PASSWORD_MAX_LENGTH: 128,
  FILE_PATH_MAX_LENGTH: 4096,
};

// Mensagens de erro
export const ERROR_MESSAGES = {
  CONNECTION_ERROR: 'Erro ao conectar com o servidor',
  VALIDATION_ERROR: 'Dados inválidos',
  NOT_FOUND: 'Recurso não encontrado',
  SERVER_ERROR: 'Erro interno do servidor',
  TIMEOUT_ERROR: 'Tempo de conexão esgotado',
  UNKNOWN_ERROR: 'Erro desconhecido',
};

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  CONFIG_SAVED: 'Configuração salva com sucesso!',
  TEST_SUCCESS: 'Conexão estabelecida com sucesso!',
  HISTORY_CLEARED: 'Histórico limpo com sucesso!',
};
