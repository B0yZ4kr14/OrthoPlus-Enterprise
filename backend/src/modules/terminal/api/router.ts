import { clinicGuard } from "@/middleware/clinicGuard";
/**
 * Terminal Module Router
 */

import { Router } from "express";
import { TerminalController } from "./TerminalController";

export function createTerminalRouter(): Router {
  const router: Router = Router();
  router.use(clinicGuard);

  // Root route — module status
  router.get("/", (_req, res) => {
    res.json({
      module: "terminal",
      version: "1.0.0",
      endpoints: ["/"],
      status: "active",
      note: "Module routes available — see router.ts for full endpoint list",
    });
  });
  const controller = new TerminalController();

  router.post("/sessions", (_req, res) => controller.createSession(_req, res));
  router.post("/execute", (_req, res) => controller.executeCommand(_req, res));
  router.get("/sessions/:sessionId/history", (_req, res) =>
    controller.getCommandHistory(_req, res),
  );
  router.delete("/sessions/:sessionId", (_req, res) =>
    controller.terminateSession(_req, res),
  );

  return router;
}
