/**
 * Types for Agents Module
 *
 * Tipagens para integração com Agno Agent Service
 */

// Re-exportar tipos do service para conveniência
export * from "../services/AgentProxyService";

// Tipos adicionais específicos do backend
interface AgentJob {
  id: string;
  type: "crud" | "bugfix" | "refactor" | "review";
  status: "pending" | "running" | "completed" | "failed";
  request: unknown;
  result?: unknown;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface AgentModuleConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  enabled: boolean;
}
