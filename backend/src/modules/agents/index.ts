/**
 * Agents Module - Módulo de Integração com Agno Agent Service
 * 
 * @module agents
 * @description
 * Este módulo fornece integração com o Agno Agent Service (Python/FastAPI)
 * para geração de código via IA: CRUD, bugfixes, refatoração e code review.
 * 
 * @example
 * ```typescript
 * import { createAgentsRouter } from './modules/agents';
 * 
 * app.use('/api/agents', createAgentsRouter());
 * ```
 */

// Router
export { createAgentsRouter } from './api/router';

// Controller
export { AgentsController } from './api/AgentsController';

// Service
export { 
  AgentProxyService,
  agentProxyService,
} from './services/AgentProxyService';

// Types
export type {
  FieldDefinition,
  CRUDRequest,
  CRUDResponse,
  BugfixRequest,
  BugfixResponse,
  RefactorRequest,
  RefactorResponse,
  CodeReviewRequest,
  CodeReviewResponse,
  HealthResponse,
} from './services/AgentProxyService';
