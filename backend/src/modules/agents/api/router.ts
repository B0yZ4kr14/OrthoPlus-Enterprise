import { clinicGuard } from "@/middleware/clinicGuard";
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
router.use(clinicGuard);
  const controller = new AgentsController();

  // ========================================================================
  // HEALTH CHECK
  // ========================================================================
  
  /**
   * GET /api/agents/health
   * Verifica se o Agent Service está disponível
   */
  router.get('/health', controller.health);
  router.post('/crud', controller.createCRUD);
  router.post('/crud/simple', controller.createCRUDSimple);
  router.post('/bugfix', controller.fixBug);
  router.post('/refactor', controller.refactor);
  router.post('/review', controller.codeReview);

  return router;
}

// Export default para compatibilidade
export default createAgentsRouter;
