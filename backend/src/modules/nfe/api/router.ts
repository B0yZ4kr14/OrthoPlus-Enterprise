import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
/**
 * MÓDULO NF-e - Router
 *
 * NF-e (Nota Fiscal Eletrônica) module routes.
 * Uses NFeRepositoryPostgres for database operations.
 */

import { Router } from 'express';
import { NFeController } from './controller';

export function createNfeRouter(): Router {
  const router: Router = Router();
  router.use(clinicGuard);
  const controller = new NFeController();

  router.get('/status', asyncHandler(controller.status.bind(controller)));
  router.get('/', asyncHandler(controller.list.bind(controller)));
  router.get('/:id', asyncHandler(controller.getById.bind(controller)));
  router.post('/', asyncHandler(controller.create.bind(controller)));
  router.patch('/:id', asyncHandler(controller.update.bind(controller)));
  router.post('/:id/cancelar', asyncHandler(controller.cancel.bind(controller)));

  return router;
}
