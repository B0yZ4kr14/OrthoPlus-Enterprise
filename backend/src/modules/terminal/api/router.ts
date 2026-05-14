import { clinicGuard } from "@/middleware/clinicGuard";
/**
 * Terminal Module Router
 */

import { Router } from 'express';
import { TerminalController } from './TerminalController';

export function createTerminalRouter(): Router {
  const router: Router = Router();
router.use(clinicGuard);

  // Root route — module status
  router.get("/", (req, res) => {
    res.json({
      module: "terminal",
      version: "1.0.0",
      endpoints: ["/"],
      status: "active",
      note: "Module routes available — see router.ts for full endpoint list"
    });
  });
  const controller = new TerminalController();

  router.post('/sessions', (req, res) => controller.createSession(req, res));
  router.post('/execute', (req, res) => controller.executeCommand(req, res));
  router.get('/sessions/:sessionId/history', (req, res) => controller.getCommandHistory(req, res));
  router.delete('/sessions/:sessionId', (req, res) => controller.terminateSession(req, res));

  return router;
}
