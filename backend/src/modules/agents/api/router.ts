/**
 * Agents Router - Rotas do módulo AGENTS
 * 
 * Integração com Agno Agent Service (Python/FastAPI)
 * Permite gerar código via IA: CRUD, bugfixes, refatoração, code review
 */

import { Router } from 'express';
import { AgentsController } from './AgentsController';

/**
 * Cria e configura o router do módulo Agents
 */
export function createAgentsRouter(): Router {
  const router = Router();
  const controller = new AgentsController();

  // ========================================================================
  // HEALTH CHECK
  // ========================================================================
  
  /**
   * GET /api/agents/health
   * Verifica se o Agent Service está disponível
   */
  router.get('/health', (req, res) => controller.health(req, res));

  // ========================================================================
  // CRUD GENERATION
  // ========================================================================
  
  /**
   * POST /api/agents/crud
   * Gera um CRUD completo (Database + Backend + Frontend)
   * 
   * Body:
   * {
   *   "entity_name": "Procedimento",
   *   "fields": [
   *     { "name": "nome", "type": "String", "required": true },
   *     { "name": "valor", "type": "Decimal", "required": true }
   *   ],
   *   "clinica_relationship": true
   * }
   */
  router.post('/crud', (req, res) => controller.createCRUD(req, res));

  /**
   * POST /api/agents/crud/simple
   * Versão simplificada para testes rápidos
   * 
   * Body (form-data ou JSON):
   * {
   *   "entity_name": "Teste",
   *   "fields": "nome:String,descricao:String?,ativo:Boolean"
   * }
   */
  router.post('/crud/simple', (req, res) => controller.createCRUDSimple(req, res));

  // ========================================================================
  // BUGFIX
  // ========================================================================
  
  /**
   * POST /api/agents/bugfix
   * Analisa um bug e sugere correção
   * 
   * Body:
   * {
   *   "bug_report": "NullPointerException em getById quando registro não existe",
   *   "file_path": "src/modules/pacientes/pacientes.controller.ts",
   *   "error_message": "Cannot read property 'id' of null"
   * }
   */
  router.post('/bugfix', (req, res) => controller.fixBug(req, res));

  // ========================================================================
  // REFACTOR
  // ========================================================================
  
  /**
   * POST /api/agents/refactor
   * Gera plano de refatoração
   * 
   * Body:
   * {
   *   "target": "PatientController",
   *   "from_pattern": "callbacks",
   *   "to_pattern": "async/await",
   *   "scope": "module"
   * }
   */
  router.post('/refactor', (req, res) => controller.refactor(req, res));

  // ========================================================================
  // CODE REVIEW
  // ========================================================================
  
  /**
   * POST /api/agents/review
   * Realiza code review de um arquivo
   * 
   * Body:
   * {
   *   "file_path": "src/modules/pacientes/pacientes.controller.ts",
   *   "code": "...código opcional..."
   * }
   */
  router.post('/review', (req, res) => controller.codeReview(req, res));

  return router;
}

// Export default para compatibilidade
export default createAgentsRouter;
