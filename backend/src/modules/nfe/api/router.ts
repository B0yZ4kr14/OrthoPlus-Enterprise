/**
 * MÓDULO NF-e - Router
 *
 * NF-e (Nota Fiscal Eletrônica) module routes.
 * Uses NFeRepositoryPostgres for database operations.
 */

import { Router } from 'express';
import { NFeController } from './controller';

export function createNfeRouter(): Router {
  const router = Router();
  const controller = new NFeController();

  router.get('/status', (req, res) => controller.status(req, res));
  router.get('/', (req, res) => controller.list(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.post('/', (req, res) => controller.create(req, res));
  router.patch('/:id', (req, res) => controller.update(req, res));
  router.post('/:id/cancelar', (req, res) => controller.cancel(req, res));

  return router;
}
