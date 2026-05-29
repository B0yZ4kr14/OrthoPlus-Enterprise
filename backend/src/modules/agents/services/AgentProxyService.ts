/**
 * AgentProxyService - Cliente HTTP para o Agno Agent Service
 *
 * Responsabilidade: Comunicar-se com o serviço Python de agents
 * rodando em localhost:8000 (ou URL configurada)
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { logger } from "@/infrastructure/logger";

// ============================================================================
// TIPOS
// ============================================================================

export interface FieldDefinition {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export interface CRUDRequest {
  entity_name: string;
  fields: FieldDefinition[];
  clinica_relationship?: boolean;
}

export interface CRUDResponse {
  entity: string;
  schema: string;
  backend: string;
  frontend: string;
  metrics: {
    schema_length: number;
    backend_length: number;
    frontend_length: number;
    total_length: number;
  };
}

export interface BugfixRequest {
  bug_report: string;
  file_path?: string;
  error_message?: string;
}

export interface BugfixResponse {
  analysis: string;
  reproduction_test?: string;
  fix: string;
  verification_steps?: string[];
}

export interface RefactorRequest {
  target: string;
  from_pattern: string;
  to_pattern: string;
  scope?: string;
}

export interface RefactorResponse {
  impact_analysis: string;
  refactoring_plan: string;
  example_changes: string;
  rollback_plan?: string;
}

export interface CodeReviewRequest {
  file_path: string;
  code?: string;
}

export interface CodeReviewResponse {
  summary: string;
  issues: Array<{
    severity: "critical" | "warning" | "info";
    line?: number;
    message: string;
    suggestion: string;
  }>;
  score: number;
  recommendations: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
  services: Record<string, string>;
}

// ============================================================================
// SERVICE
// ============================================================================

export class AgentProxyService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.AGENT_SERVICE_URL || "http://localhost:8000";
    const timeout = parseInt(process.env.AGENT_SERVICE_TIMEOUT || "120000");

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout,
      headers: { "Content-Type": "application/json" },
    });

    // Log de debug em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      logger.info(`[AgentProxyService] Conectado a: ${this.baseURL}`);
    }
  }

  // ==========================================================================
  // HEALTH
  // ==========================================================================

  async health(): Promise<HealthResponse> {
    try {
      const response = await this.client.get("/health");
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, "health");
    }
  }

  // ==========================================================================
  // CRUD WORKFLOW
  // ==========================================================================

  async createCRUD(request: CRUDRequest): Promise<CRUDResponse> {
    try {
      const response = await this.client.post("/api/agents/crud", request);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, "createCRUD");
    }
  }

  async createCRUDSimple(
    entity_name: string,
    fields: string,
  ): Promise<CRUDResponse> {
    try {
      const params = new URLSearchParams();
      params.append("entity_name", entity_name);
      params.append("fields", fields);

      const response = await this.client.post(
        "/api/agents/crud/simple",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, "createCRUDSimple");
    }
  }

  // ==========================================================================
  // BUGFIX WORKFLOW
  // ==========================================================================

  async fixBug(request: BugfixRequest): Promise<BugfixResponse> {
    try {
      const response = await this.client.post("/api/agents/bugfix", request);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, "fixBug");
    }
  }

  // ==========================================================================
  // REFACTOR WORKFLOW
  // ==========================================================================

  async refactor(request: RefactorRequest): Promise<RefactorResponse> {
    try {
      const response = await this.client.post("/api/agents/refactor", request);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, "refactor");
    }
  }

  // ==========================================================================
  // CODE REVIEW
  // ==========================================================================

  async codeReview(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    try {
      const response = await this.client.post("/api/agents/review", request);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, "codeReview");
    }
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  private handleError(error: AxiosError, operation: string): Error {
    // Connection refused - Agent Service offline
    if (error.code === "ECONNREFUSED") {
      return new Error(
        `Agent Service indisponível em ${this.baseURL}. ` +
          `Verifique se o serviço Python está rodando (python src/main.py).`,
      );
    }

    // Timeout
    if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      return new Error(
        `Timeout ao comunicar com Agent Service (${operation}). ` +
          `A operação pode estar demorando mais que o esperado.`,
      );
    }

    // HTTP error do Agent Service
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { detail?: string; error?: string };
      const message = data?.detail || data?.error || error.message;

      if (status === 400) {
        return new Error(`Requisição inválida: ${message}`);
      }
      if (status === 500) {
        return new Error(`Erro no Agent Service: ${message}`);
      }
      return new Error(`Erro ${status}: ${message}`);
    }

    // Erro genérico
    return new Error(`Erro no Agent Service (${operation}): ${error.message}`);
  }
}

export const agentProxyService = new AgentProxyService();
